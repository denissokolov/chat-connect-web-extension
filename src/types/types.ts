export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
}

export type Message = {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  error?: string
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

export interface PageContext {
  title: string
  url: string
  html: string
}

export enum Platform {
  Mac = 'mac',
  Win = 'win',
}
