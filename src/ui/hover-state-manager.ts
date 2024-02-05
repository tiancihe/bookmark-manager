import { Theme, alpha } from "@mui/material/styles"

import { HoverArea, BookmarkTreeNode } from "./types"

interface HoverStateManagerState {
    bookmarkNode: BookmarkTreeNode
    isSelected: boolean
    node: HTMLElement
    theme: Theme
    hoverArea?: HoverArea
}

const createHoverStateManager = () => {
    let state = {} as HoverStateManagerState

    const clearStyle = () => {
        if (state.node) {
            state.node.style.borderTop = ""
            !state.isSelected && (state.node.style.backgroundColor = "")
            state.node.style.borderBottom = ""
        }
    }

    const reset = () => {
        clearStyle()
        state = {} as HoverStateManagerState
    }

    const subscribe = (spec: HoverStateManagerState) => {
        // should always update theme
        if (spec.theme !== state.theme) state.theme = spec.theme
        // node is already subscribed
        if (spec.bookmarkNode.id === state.bookmarkNode?.id) return
        // clear previous subscribed element's hover style
        clearStyle()
        state = spec
    }

    const ApplyHoverStyleStrategy = {
        [HoverArea.Top]: () => {
            state.node.style.borderTop = `1px solid ${state.theme.palette.primary.main}`
        },
        [HoverArea.Mid]: () => {
            !state.isSelected && (state.node.style.backgroundColor = `${alpha(state.theme.palette.primary.main, 0.25)}`)
        },
        [HoverArea.Bottom]: () => {
            state.node.style.borderBottom = `1px solid ${state.theme.palette.primary.main}`
        },
    } as Record<HoverArea, () => void>

    const applyHoverStyle = (area: HoverArea) => {
        if (state.hoverArea !== area) {
            state.hoverArea = area
            clearStyle()
            ApplyHoverStyleStrategy[state.hoverArea]()
        }
    }

    return {
        reset,
        subscribe,
        applyHoverStyle,
    }
}

const HoverStateManager = createHoverStateManager()

export default HoverStateManager
