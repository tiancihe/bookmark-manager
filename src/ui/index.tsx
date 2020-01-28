import React from "react"
import ReactDOM from "react-dom"

import App from "./App"
import { StoreProvider } from "./contexts/store"
import { DndStoreProvider } from "./contexts/dnd"
import { ModalStoreProvider } from "./contexts/modal"

const ROOT_NODE = document.createElement("div")
document.body.appendChild(ROOT_NODE)

ReactDOM.render(
    <StoreProvider>
        <DndStoreProvider>
            <ModalStoreProvider>
                <App />
            </ModalStoreProvider>
        </DndStoreProvider>
    </StoreProvider>,
    ROOT_NODE
)
