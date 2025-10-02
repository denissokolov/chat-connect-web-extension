import { AIModel } from './provider.types'

export type Prompt = {
  id: string
  title: string
  content: string
  createdAt: string
}

export type Settings = {
  openAIToken: string
  model: AIModel
  autoExecuteTools: boolean
  prompts: Prompt[]
}
