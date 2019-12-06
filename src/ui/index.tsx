import React from "react"
import ReactDOM from "react-dom"

import App from "./App"
import { StoreProvider } from "./Store"

const ROOT_NODE = document.createElement("div")
document.body.appendChild(ROOT_NODE)

ReactDOM.render(
    <StoreProvider>
        <App />
    </StoreProvider>,
    ROOT_NODE
)
