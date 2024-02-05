import "../compat"

import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"

import store from "./store"
import ThemeWrapper from "./ThemeWrapper"

const ROOT_NODE = document.getElementById("root")!

createRoot(ROOT_NODE).render(
    <Provider store={store}>
        <ThemeWrapper />
    </Provider>,
)
