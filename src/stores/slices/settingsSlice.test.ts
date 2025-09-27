import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'

import useChatStore from '@/stores/useChatStore'
import { AIModel } from '@/types/provider.types'
import browser from '@/services/browser'
import repository from '@/services/repository'
import { Settings } from '@/types/settings.types'
import { IAssistant } from '@/services/assistant'

vi.mock('@/services/browser', () => ({
  default: {
    getSecureValue: vi.fn(),
    saveSecureValue: vi.fn(),
    subscribeToSecureValue: vi.fn(),
  },
}))

vi.mock('@/services/repository', () => ({
  default: {
    init: vi.fn(),
  },
}))

describe('settingsSlice', () => {
  const mockSettings: Settings = {
    openAIToken: 'test-token',
    model: AIModel.OpenAI_GPT_4o,
    autoExecuteTools: true,
  }

  beforeEach(() => {
    useChatStore.setState(useChatStore.getInitialState())
    vi.clearAllMocks()
  })

  describe('initSettings', () => {
    it('should initialize settings successfully', async () => {
      ;(repository.init as Mock).mockResolvedValue(undefined)
      ;(browser.getSecureValue as Mock).mockResolvedValue(JSON.stringify(mockSettings))

      const { initSettings } = useChatStore.getState()

      await initSettings()

      const state = useChatStore.getState()
      expect(state.settings.ready).toBe(true)
      expect(state.settings.loading).toBe(false)
      expect(state.settings.error).toBe(null)
      expect(state.settings.data).toEqual(mockSettings)
      expect(state.settingsForm.data).toEqual(mockSettings)
    })

    it('should use default settings when no saved settings exist', async () => {
      ;(repository.init as Mock).mockResolvedValue(undefined)
      ;(browser.getSecureValue as Mock).mockResolvedValue(null)

      const { initSettings } = useChatStore.getState()

      await initSettings()

      const state = useChatStore.getState()
      expect(state.settings.ready).toBe(true)
      expect(state.settings.data).toEqual({
        openAIToken: '',
        model: AIModel.OpenAI_GPT_5,
        autoExecuteTools: false,
      })
    })

    it('should handle repository initialization error', async () => {
      const error = new Error('Repository error')
      ;(repository.init as Mock).mockRejectedValue(error)

      const { initSettings } = useChatStore.getState()

      await initSettings()

      const state = useChatStore.getState()
      expect(state.settings.ready).toBe(false)
      expect(state.settings.loading).toBe(false)
      expect(state.settings.error).toBe('Repository error')
      expect(state.settings.data).toBe(null)
    })

    it('should handle browser.getSecureValue error', async () => {
      ;(repository.init as Mock).mockResolvedValue(undefined)
      const error = new Error('Browser error')
      ;(browser.getSecureValue as Mock).mockRejectedValue(error)

      const { initSettings } = useChatStore.getState()

      await initSettings()

      const state = useChatStore.getState()
      expect(state.settings.ready).toBe(false)
      expect(state.settings.loading).toBe(false)
      expect(state.settings.error).toBe('Browser error')
      expect(state.settings.data).toBe(null)
    })

    it('should not initialize if already ready', async () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: mockSettings,
        },
      })

      const { initSettings } = useChatStore.getState()

      await initSettings()

      expect(repository.init).not.toHaveBeenCalled()
      expect(browser.getSecureValue).not.toHaveBeenCalled()
    })

    it('should not initialize if already loading', async () => {
      useChatStore.setState({
        settings: {
          ready: false,
          loading: true,
          error: null,
          data: null,
        },
      })

      const { initSettings } = useChatStore.getState()

      await initSettings()

      expect(repository.init).not.toHaveBeenCalled()
      expect(browser.getSecureValue).not.toHaveBeenCalled()
    })

    it('should set up subscription when settings are initialized', async () => {
      ;(repository.init as Mock).mockResolvedValue(undefined)
      ;(browser.getSecureValue as Mock).mockResolvedValue(JSON.stringify(mockSettings))

      const { initSettings } = useChatStore.getState()

      await initSettings()

      expect(browser.subscribeToSecureValue).toHaveBeenCalledWith(
        'settings.v1',
        expect.any(Function),
      )
    })
  })

  describe('updateSettings', () => {
    beforeEach(() => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: mockSettings,
        },
        settingsForm: {
          saving: false,
          saved: false,
          saveError: null,
          changed: false,
          data: mockSettings,
        },
      })
    })

    it('should update settings and save to browser', () => {
      const { updateSettings } = useChatStore.getState()

      updateSettings({ model: AIModel.OpenAI_o3_mini })

      const state = useChatStore.getState()
      expect(state.settings.data?.model).toBe(AIModel.OpenAI_o3_mini)
      expect(state.settingsForm.data?.model).toBe(AIModel.OpenAI_o3_mini)
      expect(state.assistant).toBe(null)
      expect(browser.saveSecureValue).toHaveBeenCalledWith(
        'settings.v1',
        JSON.stringify({
          ...mockSettings,
          model: AIModel.OpenAI_o3_mini,
        }),
      )
    })

    it('should update multiple settings at once', () => {
      const { updateSettings } = useChatStore.getState()

      updateSettings({
        model: AIModel.OpenAI_o3,
        openAIToken: 'new-token',
        autoExecuteTools: false,
      })

      const state = useChatStore.getState()
      expect(state.settings.data).toEqual({
        model: AIModel.OpenAI_o3,
        openAIToken: 'new-token',
        autoExecuteTools: false,
      })
    })

    it('should merge with default settings when current data is null', () => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: null,
        },
      })

      const { updateSettings } = useChatStore.getState()

      updateSettings({ openAIToken: 'test-token' })

      const state = useChatStore.getState()
      expect(state.settings.data).toEqual({
        openAIToken: 'test-token',
        model: AIModel.OpenAI_GPT_5,
        autoExecuteTools: false,
      })
    })
  })

  describe('updateSettingsForm', () => {
    beforeEach(() => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: mockSettings,
        },
        settingsForm: {
          saving: false,
          saved: false,
          saveError: null,
          changed: false,
          data: mockSettings,
        },
      })
    })

    it('should update settings form data', () => {
      const { updateSettingsForm } = useChatStore.getState()

      updateSettingsForm({ model: AIModel.OpenAI_o3_mini })

      const state = useChatStore.getState()
      expect(state.settingsForm.data?.model).toBe(AIModel.OpenAI_o3_mini)
      expect(state.settingsForm.changed).toBe(true)
    })

    it('should set changed to false when form matches settings', () => {
      const { updateSettingsForm } = useChatStore.getState()

      updateSettingsForm(mockSettings)

      const state = useChatStore.getState()
      expect(state.settingsForm.changed).toBe(false)
    })

    it('should merge with default settings when form data is null', () => {
      useChatStore.setState({
        settingsForm: {
          saving: false,
          saved: false,
          saveError: null,
          changed: false,
          data: null,
        },
      })

      const { updateSettingsForm } = useChatStore.getState()

      updateSettingsForm({ openAIToken: 'test-token' })

      const state = useChatStore.getState()
      expect(state.settingsForm.data).toEqual({
        openAIToken: 'test-token',
        model: AIModel.OpenAI_GPT_5,
        autoExecuteTools: false,
      })
    })
  })

  describe('saveSettingsForm', () => {
    beforeEach(() => {
      useChatStore.setState({
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: mockSettings,
        },
        settingsForm: {
          saving: false,
          saved: false,
          saveError: null,
          changed: true,
          data: { ...mockSettings, model: AIModel.OpenAI_o3_mini },
        },
      })
    })

    it('should save settings form successfully', async () => {
      ;(browser.saveSecureValue as Mock).mockResolvedValue(undefined)

      const { saveSettingsForm } = useChatStore.getState()

      await saveSettingsForm()

      const state = useChatStore.getState()
      expect(state.settings.data?.model).toBe(AIModel.OpenAI_o3_mini)
      expect(state.settingsForm.saving).toBe(false)
      expect(state.settingsForm.saved).toBe(true)
      expect(state.settingsForm.changed).toBe(false)
      expect(state.settingsForm.saveError).toBe(null)
      expect(state.assistant).toBe(null)
    })

    it('should handle save error', async () => {
      const error = new Error('Save failed')
      ;(browser.saveSecureValue as Mock).mockRejectedValue(error)

      const { saveSettingsForm } = useChatStore.getState()

      await saveSettingsForm()

      const state = useChatStore.getState()
      expect(state.settingsForm.saving).toBe(false)
      expect(state.settingsForm.saveError).toBe('Save failed')
      expect(state.settingsForm.saved).toBe(false)
    })

    it('should set saving state during save operation', async () => {
      let resolvePromise: () => void
      const promise = new Promise<void>(resolve => {
        resolvePromise = resolve
      })
      ;(browser.saveSecureValue as Mock).mockImplementation(() => promise)

      const { saveSettingsForm } = useChatStore.getState()

      const savePromise = saveSettingsForm()

      expect(useChatStore.getState().settingsForm.saving).toBe(true)
      expect(useChatStore.getState().settingsForm.saveError).toBe(null)

      resolvePromise!()
      await savePromise

      expect(useChatStore.getState().settingsForm.saving).toBe(false)
    })

    it('should reset saved flag after timeout', async () => {
      ;(browser.saveSecureValue as Mock).mockResolvedValue(undefined)
      vi.useFakeTimers()

      const { saveSettingsForm } = useChatStore.getState()

      await saveSettingsForm()

      expect(useChatStore.getState().settingsForm.saved).toBe(true)

      vi.advanceTimersByTime(2000)

      expect(useChatStore.getState().settingsForm.saved).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('assistant property', () => {
    it('should have assistant property set to null initially', () => {
      const state = useChatStore.getState()
      expect(state.assistant).toBe(null)
    })

    it('should reset assistant when settings are updated', () => {
      const mockAssistant: IAssistant = {
        getProvider: vi.fn(),
        sendMessage: vi.fn(),
        sendFunctionCallResponse: vi.fn(),
        cancelActiveRequest: vi.fn(),
      }
      useChatStore.setState({
        assistant: mockAssistant,
        settings: {
          ready: true,
          loading: false,
          error: null,
          data: mockSettings,
        },
      })

      const { updateSettings } = useChatStore.getState()

      updateSettings({ model: AIModel.OpenAI_o3_mini })

      expect(useChatStore.getState().assistant).toBe(null)
    })
  })
})
