import "react-hot-loader"
import React from "react"
import ReactDOM from "react-dom"

import App from "./App"

const ROOT_NODE = document.createElement("div")
document.body.appendChild(ROOT_NODE)

ReactDOM.render(<App />, ROOT_NODE)
