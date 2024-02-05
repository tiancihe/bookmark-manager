import { useMemo } from "react"
import { ThemeProvider, createTheme } from "@mui/material"

import App from "./App"
import useSettings from "./hooks/useSettings"

export default function ThemeWrapper() {
    const { loadingSettings, settings } = useSettings()

    const theme = useMemo(() => {
        return createTheme({
            palette: {
                mode: settings?.darkMode ? "dark" : "light",
                primary: {
                    main: "#3367d6",
                },
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
