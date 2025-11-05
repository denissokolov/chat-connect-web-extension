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
  OpenAI_GPT_4o = 'gpt-4o',
  OpenAI_GPT_5 = 'gpt-5',
  OpenAI_GPT_5_mini = 'gpt-5-mini',
}

export enum ProviderMessageEventType {
  Created = 'created',
  OutputTextDelta = 'output_text_delta',
  FunctionCallAdded = 'function_call_added',
  FunctionCallDone = 'function_call_done',
  ReasoningSummaryTextDelta = 'reasoning_summary_text_delta',
  ReasoningSummaryTextDone = 'reasoning_summary_text_done',
  ReasoningTextDelta = 'reasoning_text_delta',
  ReasoningTextDone = 'reasoning_text_done',
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

type ProviderMessageFunctionCallAddedEvent = {
  type: ProviderMessageEventType.FunctionCallAdded
  messageId: string
  threadId: string
  content: FunctionCallContent
}

type ProviderMessageFunctionCallDoneEvent = {
  type: ProviderMessageEventType.FunctionCallDone
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

type ProviderMessageReasoningSummaryTextDeltaEvent = {
  type: ProviderMessageEventType.ReasoningSummaryTextDelta
  messageId: string
  threadId: string
  contentId: string
  textDelta: string
}

type ProviderMessageReasoningSummaryTextDoneEvent = {
  type: ProviderMessageEventType.ReasoningSummaryTextDone
  messageId: string
  threadId: string
  contentId: string
  text: string
}

type ProviderMessageReasoningTextDeltaEvent = {
  type: ProviderMessageEventType.ReasoningTextDelta
  messageId: string
  threadId: string
  contentId: string
  textDelta: string
}

type ProviderMessageReasoningTextDoneEvent = {
  type: ProviderMessageEventType.ReasoningTextDone
  messageId: string
  threadId: string
  contentId: string
  text: string
}

export type ProviderMessageEvent =
  | ProviderMessageCreatedEvent
  | ProviderMessageOutputTextDeltaEvent
  | ProviderMessageFunctionCallAddedEvent
  | ProviderMessageFunctionCallDoneEvent
  | ProviderMessageReasoningSummaryTextDeltaEvent
  | ProviderMessageReasoningSummaryTextDoneEvent
  | ProviderMessageReasoningTextDeltaEvent
  | ProviderMessageReasoningTextDoneEvent
  | ProviderMessageCompletedEvent
  | ProviderMessageErrorEvent
  | ProviderMessageFallbackEvent
