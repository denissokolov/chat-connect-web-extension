import { describe, it, expect, beforeEach } from 'vitest'

import useChatStore from '@/stores/useChatStore'
import { AIModel } from '@/types/provider.types'

describe('modelSlice', () => {
  beforeEach(() => {
    useChatStore.setState(useChatStore.getInitialState())
  })

  describe('setModel', () => {
    it('should update the model', () => {
      const { setModel } = useChatStore.getState()

      setModel(AIModel.OpenAI_GPT_4o)

      expect(useChatStore.getState().model).toBe(AIModel.OpenAI_GPT_4o)
    })

    it('should update the model to different AI models', () => {
      const { setModel } = useChatStore.getState()

      setModel(AIModel.OpenAI_o3_mini)
      expect(useChatStore.getState().model).toBe(AIModel.OpenAI_o3_mini)

      setModel(AIModel.OpenAI_GPT_4_1)
      expect(useChatStore.getState().model).toBe(AIModel.OpenAI_GPT_4_1)
    })
  })
})
