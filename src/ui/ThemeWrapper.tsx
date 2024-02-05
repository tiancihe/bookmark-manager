import { useMemo } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"

import App from "./App"
import useSettings from "./hooks/useSettings"

export default function ThemeWrapper() {
    const { loadingSettings, settings } = useSettings()

    const theme = useMemo(() => {
        return createTheme({
            palette: {
                mode: settings?.darkMode ? "dark" : "light",
            },
        })
    }, [settings])

    if (loadingSettings) return null

    return (
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    )
}
