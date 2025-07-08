export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
}

export enum MessageContentType {
  OutputText = 'output_text',
  FunctionCall = 'function_call',
}

export enum FunctionName {
  FillInput = 'fill_input',
  ClickButton = 'click_button',
}

export enum FunctionStatus {
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}

export type FunctionCallResult = {
  success: boolean
  error?: string
}

export type FillInputArguments = {
  input_type: string
  input_value: string
  input_selector: string
  label_value: string
}

export type ClickButtonArguments = {
  button_selector: string
  button_text: string
}

export type MessageContent =
  | {
      id: string
      type: MessageContentType.OutputText
      text: string
    }
  | {
      id: string
      type: MessageContentType.FunctionCall
      status: FunctionStatus
      result?: FunctionCallResult
      name: FunctionName.FillInput
      arguments: FillInputArguments
    }
  | {
      id: string
      type: MessageContentType.FunctionCall
      status: FunctionStatus
      result?: FunctionCallResult
      name: FunctionName.ClickButton
      arguments: ClickButtonArguments
    }

export type MessageContext = {
  title: string
  favicon?: string
  url?: string
}

export type Message = {
  id: string
  role: MessageRole
  content: MessageContent[]
  createdAt: string
  error?: string
  threadId: string
  context?: MessageContext
}

export enum AIProvider {
  OpenAI = 'openai',
  Mock = 'mock',
}

export enum AIModel {
  OpenAI_o4_mini = 'o4-mini',
  OpenAI_o3_mini = 'o3-mini',
  OpenAI_o3 = 'o3',
  OpenAI_GPT_4_1 = 'gpt-4.1',
  OpenAI_GPT_4_1_mini = 'gpt-4.1-mini',
  OpenAI_GPT_4_1_nano = 'gpt-4.1-nano',
  OpenAI_GPT_4o = 'gpt-4o',
  OpenAI_ChatGPT_4o = 'chatgpt-4o-latest',
}

export type ProviderMessageResponse = {
  id: string
  content: MessageContent[]
  hasTools: boolean
}

export interface PageContext {
  title: string
  url: string
  html: string
  favicon: string | null
}

export enum Platform {
  Mac = 'mac',
  Win = 'win',
}

export type Thread = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export enum ChatView {
  Chat = 'chat',
  History = 'history',
}
