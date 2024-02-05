import "../compat"
import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"

import store from "./store"
import App from "./App"

const ROOT_NODE = document.createElement("div")
document.body.appendChild(ROOT_NODE)

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    ROOT_NODE,
)
