import React from "react"
import ReactDOM from "react-dom"
import { StaticRouter } from "react-router-dom"

import App from "./App"
import { StoreProvider } from "./Store"

const ROOT_NODE = document.createElement("div")
document.body.appendChild(ROOT_NODE)

ReactDOM.render(
    <StoreProvider>
        <StaticRouter>
            <App />
        </StaticRouter>
    </StoreProvider>,
    ROOT_NODE
)
