import { type StateCreator } from 'zustand'

import type { SettingsSlice, ChatStore } from '@/stores/useChatStore.types'
import { Settings } from '@/types/settings.types'
import browser from '@/services/browser'
import { AIModel } from '@/types/provider.types'
import { getStringError } from '@/utils/error'
import { logError } from '@/utils/log'
import repository from '@/services/repository'
import { shallowEqual } from '@/utils/object'

const SETTINGS_KEY = 'settings.v1'

const defaultSettings: Settings = {
  openAIToken: '',
  model: AIModel.OpenAI_GPT_5,
  autoExecuteTools: false,
}

export const createSettingsSlice: StateCreator<ChatStore, [], [], SettingsSlice> = (set, get) => ({
  settings: {
    ready: false,
    loading: false,
    error: null,
    data: null,
  },
  settingsForm: {
    saving: false,
    saved: false,
    saveError: null,
    changed: false,
    data: null,
  },
  initSettings: async () => {
    const { settings, loadSettings } = get()
    if (settings.ready || settings.loading || settings.error) {
      return
    }
    await loadSettings()
  },
  loadSettings: async () => {
    set(state => ({ settings: { ...state.settings, loading: true, error: null } }))

    try {
      await repository.init()
    } catch (error) {
      logError('Error initializing repository', error)
      set({
        settings: { ready: false, loading: false, error: getStringError(error), data: null },
      })
      return
    }

    let data: Settings | null = null
    try {
      const saved = await browser.getSecureValue(SETTINGS_KEY)
      data = saved ? JSON.parse(saved) : defaultSettings
    } catch (error) {
      set({
        settings: { ready: false, loading: false, error: getStringError(error), data: null },
      })
    }

    if (data) {
      browser.subscribeToSecureValue(SETTINGS_KEY, (value: string | null) => {
        const freshData: Settings = value ? JSON.parse(value) : defaultSettings
        const state = get()
        if (!shallowEqual(data, state.settings.data)) {
          set({
            settings: { ...state.settings, data: freshData },
            settingsForm: { ...state.settingsForm, data: freshData },
            assistant: null,
          })
        }
      })

      set(state => ({
        settings: { ready: true, loading: false, error: null, data },
        settingsForm: { ...state.settingsForm, data },
      }))
    }
  },
  updateSettings: (newSettings: Partial<Settings>) => {
    const { settings, settingsForm } = get()
    const data: Settings = { ...defaultSettings, ...settings.data, ...newSettings }
    set({
      settings: { ...settings, data },
      settingsForm: { ...settingsForm, data },
      assistant: null,
    })
    browser.saveSecureValue(SETTINGS_KEY, JSON.stringify(data))
  },
  updateSettingsForm: (newSettings: Partial<Settings>) => {
    const { settingsForm, settings } = get()

    const data: Settings = { ...defaultSettings, ...settingsForm.data, ...newSettings }

    const changed = !shallowEqual(settings.data, data)

    set({ settingsForm: { ...settingsForm, data, changed } })
  },
  saveSettingsForm: async () => {
    const { settingsForm, settings } = get()
    set({
      settingsForm: { ...settingsForm, saving: true, saveError: null },
    })
    try {
      await browser.saveSecureValue(SETTINGS_KEY, JSON.stringify(settingsForm.data))
      set({
        settings: { ...settings, data: settingsForm.data },
        settingsForm: { ...settingsForm, saving: false, saved: true, changed: false },
        assistant: null,
      })
      setTimeout(() => {
        set(state => ({
          settingsForm: { ...state.settingsForm, saved: false },
        }))
      }, 2000)
    } catch (error) {
      set({ settingsForm: { ...settingsForm, saving: false, saveError: getStringError(error) } })
    }
  },
  assistant: null,
})
