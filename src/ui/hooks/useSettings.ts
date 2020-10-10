import { useState, useEffect } from "react"

import { Settings } from "../types"
import { SettingsManager } from "../utils/storage"

export default function useSettings() {
    const [loadingSettings, setLoadingSettings] = useState(true)

    const [settings, setSettings] = useState<Settings>()

    useEffect(() => {
        const init = async () => {
            const settings = await SettingsManager.getSettings()
            setLoadingSettings(false)
            setSettings(settings)
            SettingsManager.listen(setSettings)
        }
        init()
    }, [])

    return {
        loadingSettings,
        settings,
        setSettings: SettingsManager.setSettings,
    }
}
