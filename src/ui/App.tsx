import React from "react"
import { Route } from "react-router-dom"
import { CssBaseline } from "@material-ui/core"

import Navbar from "./components/Navbar"
import BookmarkTreeView from "./components/BookmarkTreeView"

const App: React.FC = () => {
    return (
        <div>
            <CssBaseline />
            <Navbar />
            <Route path="/" exact component={BookmarkTreeView} />
        </div>
    )
}

export default App
