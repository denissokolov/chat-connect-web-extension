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
