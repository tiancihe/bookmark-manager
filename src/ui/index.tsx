import "../compat"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

import { createRoot } from "react-dom/client"

import ThemeWrapper from "./ThemeWrapper"

const ROOT_NODE = document.getElementById("root")!

createRoot(ROOT_NODE).render(<ThemeWrapper />)
