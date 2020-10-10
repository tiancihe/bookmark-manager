import { Settings } from "../types"

const SETTINGS_KEY = "__SETTINGS__"

export const DEFAULT_SETTINGS: Settings = {
    darkMode: false,
    disableFavicon: false,
    alwaysShowURL: false,
}

type SettingsListener = (settings: Settings) => void

function createSettingsManager() {
    const listeners: SettingsListener[] = []

    const listen = (listener: SettingsListener) => listeners.push(listener)

    const setSettings = async (settings: Settings) => {
        await browser.storage.local.set({ [SETTINGS_KEY]: settings })
        listeners.forEach(listener => listener(settings))
    }

    const getSettings = async () => {
        const settings = (await browser.storage.local.get(SETTINGS_KEY))[SETTINGS_KEY] as Settings
        if (settings) return settings
        setSettings(DEFAULT_SETTINGS)
        return DEFAULT_SETTINGS
    }

    return {
        listen,
        getSettings,
        setSettings,
    }
}

export const SettingsManager = createSettingsManager()
