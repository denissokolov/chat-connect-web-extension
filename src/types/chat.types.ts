import type {
  FunctionCallResult,
  FunctionName,
  FunctionStatus,
  FillInputArguments,
  ClickButtonArguments,
  GetPageContentArguments,
} from './tool.types'

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
}

export enum MessageContentType {
  OutputText = 'output_text',
  FunctionCall = 'function_call',
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
      name: FunctionName.ClickButton
      arguments: ClickButtonArguments
    }
  | {
      id: string
      type: MessageContentType.FunctionCall
      status: FunctionStatus
      result?: FunctionCallResult
      name: FunctionName.GetPageContent
      arguments: GetPageContentArguments
    }

export type MessageContent =
  | {
      id: string
      type: MessageContentType.OutputText
      text: string
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
