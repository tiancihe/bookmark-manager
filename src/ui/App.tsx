import React from "react"
import { CssBaseline, makeStyles } from "@material-ui/core"

import Navbar from "./components/Navbar"
import FolderPanel from "./components/FolderPanel"
import SubfolderPanel from "./components/SubfolderPanel"

const useAppStyle = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column"
    },
    mainContent: {
        display: "flex"
    },
    folderPanel: {
        width: "40%"
    },
    subfolderPanel: {
        width: "60%"
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
