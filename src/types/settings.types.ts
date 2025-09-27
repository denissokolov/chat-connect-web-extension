import { AIModel } from './provider.types'

export type Settings = {
  openAIToken: string
  model: AIModel
  autoExecuteTools: boolean
}
