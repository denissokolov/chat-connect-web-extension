import { AIModel, AIProvider } from '@/types/types'

export const getProviderByModel = (model: AIModel): AIProvider => {
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
