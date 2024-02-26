import { useEffect, useMemo } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"

import App from "./App"
import { loadSettings, useStore } from "./store"

export default function ThemeWrapper() {
    const loadingSettings = useStore(state => state.loadingSettings)

    const settings = useStore(state => state.settings)

    useEffect(() => {
        loadSettings()
    }, [])

    const theme = useMemo(() => {
        return createTheme({
            palette: {
                mode: settings?.darkMode ? "dark" : "light",
            },
        })
    }, [settings])

    // don't render anything before settings are load to prevent ui flash
    if (loadingSettings) return null

    return (
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    )
}
