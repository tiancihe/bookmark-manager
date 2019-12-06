import React from "react"
import { CssBaseline } from "@material-ui/core"

import Navbar from "./components/Navbar"
import FolderPanel from "./components/FolderPanel"
import BookmarkTreeView from "./components/BookmarkTreeView"

const App: React.FC = () => {
    return (
        <React.Fragment>
            <CssBaseline />
            <Navbar />
            <div style={{ display: "flex" }}>
                <div style={{ width: "40%" }}>
                    <FolderPanel />
                </div>
                <div>
                    <BookmarkTreeView />
                </div>
            </div>
        </React.Fragment>
    )
}

export default App
