import React from "react"
import { Toolbar, Paper } from "@material-ui/core"

import { useStore } from "./Store"
import BookmarkCard from "./components/BookmarkCard"

const App: React.FC = () => {
    const store = useStore()

    console.log(store)

    return (
        <div>
            <Toolbar title="Bookmark Manager"></Toolbar>
            <Paper>
                {store.bookmarkTreeNodes.map(node => (
                    <BookmarkCard key={node.id} bookmarkNode={node} />
                ))}
            </Paper>
        </div>
    )
}

export default App
