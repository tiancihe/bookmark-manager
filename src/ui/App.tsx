import React from "react"
import { CssBaseline } from "@material-ui/core"

import Navbar from "./components/Navbar"
import BookmarkTreeView from "./components/BookmarkTreeView"

const App: React.FC = () => {
    return (
        <React.Fragment>
            <CssBaseline />
            <Navbar />
            <BookmarkTreeView />
        </React.Fragment>
    )
}

export default App
