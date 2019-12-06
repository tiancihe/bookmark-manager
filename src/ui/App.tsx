import React from "react"
import { CssBaseline, makeStyles } from "@material-ui/core"

import Navbar from "./components/Navbar"
import FolderPanel from "./components/FolderPanel"
import SubfolderPanel from "./components/SubfolderPanel"

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
        width: "30%",
        height: "100%",
        padding: "8px 4px 0 16px",
        overflow: "auto"
    },
    subfolderPanel: {
        width: "70%",
        height: "100%",
        padding: "24px 32px 24px 16px",
        overflow: "auto"
    }
})

const App: React.FC = () => {
    const classNames = useAppStyle()

    return (
        <div className={classNames.container}>
            <CssBaseline />
            <Navbar />
            <div className={classNames.mainContent}>
                <div className={classNames.folderPanel}>
                    <FolderPanel />
                </div>
                <div className={classNames.subfolderPanel}>
                    <SubfolderPanel />
                </div>
            </div>
        </div>
    )
}

export default App
