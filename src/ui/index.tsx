import React from "react"
import ReactDOM from "react-dom"

import App from "./App"
import { StoreProvider } from "./Store"
import { DndStoreProvider } from "./contexts/dnd"

const ROOT_NODE = document.createElement("div")
document.body.appendChild(ROOT_NODE)

ReactDOM.render(
    <StoreProvider>
        <DndStoreProvider>
            <App />
        </DndStoreProvider>
    </StoreProvider>,
    ROOT_NODE
)
