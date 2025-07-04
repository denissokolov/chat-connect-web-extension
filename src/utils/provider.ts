import { AIModel, AIProvider } from '@/types/types'
import { isStorybookEnv, isTestEnv } from './env'

export const getProviderByModel = (model: AIModel): AIProvider => {
  if (isTestEnv() || isStorybookEnv()) {
    return AIProvider.Mock
  }

  switch (model) {
    case AIModel.OpenAI_o4_mini:
    case AIModel.OpenAI_o3_mini:
    case AIModel.OpenAI_o3:
    case AIModel.OpenAI_GPT_4_1:
    case AIModel.OpenAI_GPT_4_1_mini:
    case AIModel.OpenAI_GPT_4_1_nano:
    case AIModel.OpenAI_GPT_4o:
    case AIModel.OpenAI_ChatGPT_4o:
      return AIProvider.OpenAI
  }
}

export function getModelDisplayName(model: AIModel): string {
  switch (model) {
    case AIModel.OpenAI_o4_mini:
      return 'o4-mini'
    case AIModel.OpenAI_o3_mini:
      return 'o3-mini'
    case AIModel.OpenAI_o3:
      return 'o3'
    case AIModel.OpenAI_GPT_4_1:
      return 'GPT-4.1'
    case AIModel.OpenAI_GPT_4_1_mini:
      return 'GPT-4.1 Mini'
    case AIModel.OpenAI_GPT_4_1_nano:
      return 'GPT-4.1 Nano'
    case AIModel.OpenAI_GPT_4o:
      return 'GPT-4o'
    case AIModel.OpenAI_ChatGPT_4o:
      return 'ChatGPT-4o'
    default:
      return model
  }
}
