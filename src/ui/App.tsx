import React, { useEffect } from "react"
import {
    CssBaseline,
    makeStyles,
    createMuiTheme,
    useMediaQuery,
    MuiThemeProvider
} from "@material-ui/core"
import { DndProvider } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"

import Navbar from "./components/Navbar"
import FolderPanel from "./components/FolderPanel"
import SubfolderPanel from "./components/SubfolderPanel"
import { useStore } from "./Store"

const useAppStyle = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh"
    },
    mainContent: {
        flex: 1,
        display: "flex",
        overflow: "hidden"
    },
    folderPanel: {
        width: "256px",
        height: "100%",
        padding: "8px 4px 0 16px",
        overflow: "auto"
    },
    subfolderPanel: {
        flex: 1,
        height: "100%",
        padding: "24px 32px 24px 16px",
        overflow: "auto"
    }
})

const App: React.FC = () => {
    const { darkMode } = useStore()

    const classNames = useAppStyle()

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

    useEffect(() => {
        if (darkMode !== prefersDarkMode) {
        }
    }, [prefersDarkMode])

    const theme = React.useMemo(() => {
        return createMuiTheme({
            palette: {
                type: darkMode ? "dark" : "light",
                primary: {
                    main: "#3367d6"
                }
            }
        })
    }, [darkMode])

    return (
        <MuiThemeProvider theme={theme}>
            <div className={classNames.container}>
                <CssBaseline />
                <Navbar />
                <DndProvider backend={HTML5Backend}>
                    <div className={classNames.mainContent}>
                        <FolderPanel className={classNames.folderPanel} />
                        <SubfolderPanel className={classNames.subfolderPanel} />
                    </div>
                </DndProvider>
            </div>
        </MuiThemeProvider>
    )
}

export default App
