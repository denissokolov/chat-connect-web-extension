import { AIModel } from './provider.types'

export type Settings = {
  openAIToken: string
  openAIServer: string
  model: AIModel
  autoExecuteTools: boolean
}
