import OpenAI from 'openai'
import type { Tool, Response, ResponseInputItem } from 'openai/resources/responses/responses'

import {
  AIModel,
  AIProvider,
  type Message,
  MessageContentType,
  type MessageContent,
  type ProviderMessageResponse,
  FunctionName,
  FunctionStatus,
  type PageContext,
  type VectorStore,
  type Annotation,
} from '@/types/types'
import type { IAssistant } from '@/services/assistant'
import { logDebug, logError } from '@/utils/log'

export class OpenAIAssistant implements IAssistant {
  private client: OpenAI
  private vectorStores: Map<string, VectorStore> = new Map()
  private assistants: Map<string, string> = new Map() // model -> assistantId

  constructor(apiKey: string) {
    this.client = new OpenAI({
      dangerouslyAllowBrowser: true,
      apiKey,
    })
  }

  getProvider(): AIProvider {
    return AIProvider.OpenAI
  }

  async sendMessage(params: {
    model: AIModel
    instructions?: string
    text: string
    history?: Message[]
    signal?: AbortSignal
  }): Promise<ProviderMessageResponse> {
    const response = await this.client.responses.create(
      {
        model: params.model,
        instructions: params.instructions,
        input: params.text,
        previous_response_id: this.getPreviousResponseId(params.history),
        store: true,
        tools: [this.getFillInputTool(), this.getClickButtonTool()],
      },
      {
        signal: params.signal,
      },
    )

    logDebug('OpenAIAssistant.sendMessage.response', response)

    return this.parseResponse(response)
  }

  public async sendFunctionCallResponse(params: {
    model: AIModel
    message: Message
  }): Promise<ProviderMessageResponse> {
    const input = params.message.content.reduce((acc, content) => {
      if (content.type === MessageContentType.FunctionCall) {
        acc.push({
          type: 'function_call_output',
          call_id: content.id,
          output: JSON.stringify(content.result),
        })
      }
      return acc
    }, [] as ResponseInputItem.FunctionCallOutput[])

    const response = await this.client.responses.create({
      model: params.model,
      input,
      previous_response_id: params.message.id,
      store: true,
      tools: [this.getFillInputTool(), this.getClickButtonTool()],
    })

    logDebug('OpenAIAssistant.sendMessage.functionCallResponse', response)

    return this.parseResponse(response)
  }

  async sendMessageWithPageContext(params: {
    model: AIModel
    instructions?: string
    text: string
    pageContext: PageContext
    history?: Message[]
    signal?: AbortSignal
  }): Promise<ProviderMessageResponse> {
    logDebug('OpenAIAssistant.sendMessageWithPageContext.params', params)

    try {
      // Create or get vector store for this page
      const vectorStore = await this.getOrCreateVectorStore(params.pageContext)
      logDebug('OpenAIAssistant.sendMessageWithPageContext.vectorStore', vectorStore)

      // Create or get assistant with file search capability
      const assistantId = await this.getOrCreateAssistant(
        params.model,
        vectorStore.id,
        params.instructions,
      )
      logDebug('OpenAIAssistant.sendMessageWithPageContext.assistantId', assistantId)

      // Create thread for this conversation
      const thread = await this.client.beta.threads.create()
      logDebug('OpenAIAssistant.sendMessageWithPageContext.thread', thread)

      // Add user message to thread
      await this.client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: params.text,
      })

      // Run the assistant
      const run = await this.client.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId,
      })
      logDebug('OpenAIAssistant.sendMessageWithPageContext.run', run)

      // Wait for completion
      await this.waitForRunCompletion(thread.id, run.id, params.signal)
      logDebug('OpenAIAssistant.sendMessageWithPageContext.runCompleted', {
        threadId: thread.id,
        runId: run.id,
      })

      // Get the assistant's response
      const messages = await this.client.beta.threads.messages.list(thread.id, {
        order: 'desc',
        limit: 1,
      })

      const assistantMessage = messages.data[0]
      if (!assistantMessage || assistantMessage.role !== 'assistant') {
        throw new Error('No assistant response found')
      }

      // Convert to our format
      const response = this.parseAssistantMessage(assistantMessage)

      logDebug('OpenAIAssistant.sendMessageWithPageContext.response', response)

      return response
    } catch (error) {
      logError('Error in sendMessageWithPageContext', error)
      throw error
    }
  }

  private getPreviousResponseId(history?: Message[]): string | undefined {
    return history && history.length > 0 ? history[history.length - 1]?.id : undefined
  }

  public parseResponse(response: Response): ProviderMessageResponse {
    let hasTools = false
    const result = response.output.reduce((acc, output) => {
      if (output.type === 'message') {
        output.content.forEach((content, index) => {
          if (content.type === 'output_text') {
            acc.push({
              id: `${output.id}-${index}`,
              type: MessageContentType.OutputText,
              text: content.text,
              annotations: content.annotations || [],
            })
          }
        })
      } else if (output.type === 'function_call') {
        hasTools = true
        const args = JSON.parse(output.arguments)
        if (output.name === FunctionName.FillInput) {
          acc.push({
            id: output.call_id,
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.FillInput,
            arguments: {
              input_type: args.input_type,
              input_value: args.input_value,
              input_selector: args.input_selector,
              label_value: args.label_value,
            },
          })
        } else if (output.name === FunctionName.ClickButton) {
          acc.push({
            id: output.call_id,
            type: MessageContentType.FunctionCall,
            status: FunctionStatus.Idle,
            name: FunctionName.ClickButton,
            arguments: {
              button_selector: args.button_selector,
              button_text: args.button_text,
            },
          })
        }
      }
      return acc
    }, [] as MessageContent[])

    return {
      id: response.id,
      content: result,
      hasTools,
    }
  }

  private getFillInputTool(): Tool {
    return {
      type: 'function',
      name: 'fill_input',
      description: 'Fill the given value into the input field on the page.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          input_type: {
            type: 'string',
            enum: ['input', 'textarea', 'select', 'radio', 'checkbox'],
            description: 'The type of the input to fill',
          },
          input_value: {
            type: 'string',
            description: 'The value to fill in the input',
          },
          input_selector: {
            type: 'string',
            description:
              'The selector of the input to fill. It will be used as document.querySelector(input_selector).',
          },
          label_value: {
            type: 'string',
            description:
              'The value of the label of the input to fill. Provide any relevant details if there is no label, e.g. the placeholder text.',
          },
        },
        required: ['input_type', 'input_value', 'input_selector', 'label_value'],
        additionalProperties: false,
      },
    }
  }

  private getClickButtonTool(): Tool {
    return {
      type: 'function',
      name: 'click_button',
      description: 'Click the button on the page.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          button_selector: {
            type: 'string',
            description:
              'The selector of the button to click. It will be used as document.querySelector(button_selector).',
          },
          button_text: {
            type: 'string',
            description:
              'The text of the button to click. Provide any relevant details if there is no text, e.g. the button label.',
          },
        },
        required: ['button_selector', 'button_text'],
        additionalProperties: false,
      },
    }
  }

  private async getOrCreateVectorStore(pageContext: PageContext): Promise<VectorStore> {
    const storeKey = `${pageContext.url}-${this.hashContent(pageContext.html)}`

    if (this.vectorStores.has(storeKey)) {
      return this.vectorStores.get(storeKey)!
    }

    try {
      // Create vector store
      const vectorStore = await this.client.vectorStores.create({
        name: `Page: ${pageContext.title}`,
        expires_after: {
          anchor: 'last_active_at',
          days: 7, // Auto-delete after 7 days of inactivity
        },
      })

      // Create file from HTML content
      const htmlFile = new File(
        [pageContext.html],
        `${pageContext.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`,
        { type: 'text/html' },
      )

      // Upload file
      const file = await this.client.files.create({
        file: htmlFile,
        purpose: 'assistants',
      })

      // Add file to vector store
      await this.client.vectorStores.files.create(vectorStore.id, {
        file_id: file.id,
      })

      const store: VectorStore = {
        id: vectorStore.id,
        name: pageContext.title,
        url: pageContext.url,
        fileId: file.id,
      }

      this.vectorStores.set(storeKey, store)
      return store
    } catch (error) {
      logError('Error creating vector store', error)
      throw error
    }
  }

  private async getOrCreateAssistant(
    model: AIModel,
    vectorStoreId: string,
    instructions?: string,
  ): Promise<string> {
    const assistantKey = `${model}-${vectorStoreId}`

    if (this.assistants.has(assistantKey)) {
      return this.assistants.get(assistantKey)!
    }

    try {
      const assistant = await this.client.beta.assistants.create({
        name: 'Page Context Assistant',
        instructions:
          instructions ||
          'You are a helpful assistant that can answer questions about the provided webpage content using file search.',
        model: model,
        tools: [
          { type: 'file_search' },
          this.getAssistantFillInputTool(),
          this.getAssistantClickButtonTool(),
        ],
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStoreId],
          },
        },
      })

      this.assistants.set(assistantKey, assistant.id)
      return assistant.id
    } catch (error) {
      logError('Error creating assistant', error)
      throw error
    }
  }

  private async waitForRunCompletion(
    threadId: string,
    runId: string,
    signal?: AbortSignal,
  ): Promise<any> {
    while (true) {
      if (signal?.aborted) {
        throw new Error('Request aborted')
      }

      const run = await this.client.beta.threads.runs.retrieve(runId, { thread_id: threadId })

      if (run.status === 'completed') {
        return run
      } else if (
        run.status === 'failed' ||
        run.status === 'cancelled' ||
        run.status === 'expired'
      ) {
        throw new Error(`Run ${run.status}: ${run.last_error?.message || 'Unknown error'}`)
      }

      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  private parseAssistantMessage(message: any): ProviderMessageResponse {
    const content: MessageContent[] = []

    for (const contentItem of message.content) {
      if (contentItem.type === 'text') {
        content.push({
          id: `${message.id}-text`,
          type: MessageContentType.OutputText,
          text: contentItem.text.value,
          annotations: contentItem.text.annotations || [],
        })
      }
    }

    return {
      id: message.id,
      content,
      hasTools: false, // File search is handled internally by OpenAI
    }
  }

  private hashContent(content: string): string {
    // Simple hash function for content deduplication
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  private getAssistantFillInputTool() {
    return {
      type: 'function' as const,
      function: {
        name: 'fill_input',
        description: 'Fill the given value into the input field on the page.',
        strict: true,
        parameters: {
          type: 'object',
          properties: {
            input_type: {
              type: 'string',
              enum: ['input', 'textarea', 'select', 'radio', 'checkbox'],
              description: 'The type of the input to fill',
            },
            input_value: {
              type: 'string',
              description: 'The value to fill in the input',
            },
            input_selector: {
              type: 'string',
              description:
                'The selector of the input to fill. It will be used as document.querySelector(input_selector).',
            },
            label_value: {
              type: 'string',
              description:
                'The value of the label of the input to fill. Provide any relevant details if there is no label, e.g. the placeholder text.',
            },
          },
          required: ['input_type', 'input_value', 'input_selector', 'label_value'],
          additionalProperties: false,
        },
      },
    }
  }

  private getAssistantClickButtonTool() {
    return {
      type: 'function' as const,
      function: {
        name: 'click_button',
        description: 'Click the button on the page.',
        strict: true,
        parameters: {
          type: 'object',
          properties: {
            button_selector: {
              type: 'string',
              description:
                'The selector of the button to click. It will be used as document.querySelector(button_selector).',
            },
            button_text: {
              type: 'string',
              description:
                'The text of the button to click. Provide any relevant details if there is no text, e.g. the button label.',
            },
          },
          required: ['button_selector', 'button_text'],
          additionalProperties: false,
        },
      },
    }
  }
}
