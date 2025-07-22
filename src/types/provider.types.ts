import type { FunctionCallContent, MessageContent } from './chat.types'

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

export enum ProviderMessageEventType {
  Created = 'created',
  OutputTextDelta = 'output_text_delta',
  FunctionCall = 'function_call',
  Completed = 'completed',
  Error = 'error',
  Fallback = 'fallback',
}

type ProviderMessageCreatedEvent = {
  type: ProviderMessageEventType.Created
  messageId: string
  threadId: string
}

type ProviderMessageOutputTextDeltaEvent = {
  type: ProviderMessageEventType.OutputTextDelta
  messageId: string
  threadId: string
  contentId: string
  textDelta: string
}

type ProviderMessageFunctionCallEvent = {
  type: ProviderMessageEventType.FunctionCall
  messageId: string
  threadId: string
  content: FunctionCallContent
}

type ProviderMessageCompletedEvent = {
  type: ProviderMessageEventType.Completed
  messageId: string
  userMessageId: string
  threadId: string
}

type ProviderMessageErrorEvent = {
  type: ProviderMessageEventType.Error
  messageId?: string
  userMessageId: string
  threadId: string
  error: string
}

type ProviderMessageFallbackEvent = {
  type: ProviderMessageEventType.Fallback
  messageId: string
  userMessageId: string
  threadId: string
  content: MessageContent[]
  hasTools: boolean
}

export type ProviderMessageEvent =
  | ProviderMessageCreatedEvent
  | ProviderMessageOutputTextDeltaEvent
  | ProviderMessageFunctionCallEvent
  | ProviderMessageCompletedEvent
  | ProviderMessageErrorEvent
  | ProviderMessageFallbackEvent
