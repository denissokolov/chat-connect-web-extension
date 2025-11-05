import type {
  FunctionCallResult,
  FunctionName,
  FunctionStatus,
  FillInputArguments,
  ClickElementArguments,
  GetPageContentArguments,
} from './tool.types'

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
}

export enum MessageContentType {
  OutputText = 'output_text',
  FunctionCall = 'function_call',
  Reasoning = 'reasoning',
}

export type FunctionCallContent =
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
      name: FunctionName.ClickElement
      arguments: ClickElementArguments
    }
  | {
      id: string
      type: MessageContentType.FunctionCall
      status: FunctionStatus
      result?: FunctionCallResult
      name: FunctionName.GetPageContent
      arguments: GetPageContentArguments
    }
  | {
      id: string
      type: MessageContentType.FunctionCall
      name: FunctionName.Placeholder
    }

export type MessageContent =
  | {
      id: string
      type: MessageContentType.OutputText
      text: string
    }
  | {
      id: string
      type: MessageContentType.Reasoning
      summaryText: string
      detailText?: string
      isExpanded?: boolean
    }
  | FunctionCallContent

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
  hasError?: boolean
  threadId: string
  context?: MessageContext
  complete: boolean
  history?: boolean
}

export type MessageGroup = {
  id: string
  messages: Message[]
  history: boolean
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
