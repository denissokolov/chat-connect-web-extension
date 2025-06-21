export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
}

export type Message = {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  loading?: boolean
}

export enum AIProvider {
  OpenAI = 'openai',
}
