import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { BookmarkTreeNode } from "../../types"
import { HoverState } from "../types"

export const slice = createSlice({
    name: "dnd",
    initialState: {
        selectedNodes: [] as BookmarkTreeNode[],
        hoverState: null as HoverState | null
    },
    reducers: {
        resetDndState: state => {
            state.selectedNodes = []
            state.hoverState = null
        },
        selectNode: (state, action: PayloadAction<BookmarkTreeNode>) => {
            state.selectedNodes = [action.payload]
        },
        selectNodes: (state, action: PayloadAction<BookmarkTreeNode[]>) => {
            state.selectedNodes = action.payload
        },
        clearSelectedNodes: state => {
            state.selectedNodes = []
        },
        setHoverState: (state, action: PayloadAction<HoverState>) => {
            state.hoverState = action.payload
        },
        clearHoverState: state => {
            state.hoverState = null
        }
    }
})

export const {
    resetDndState,
    selectNode,
    selectNodes,
    clearSelectedNodes,
    setHoverState,
    clearHoverState
} = slice.actions

export const dnd = slice.reducer
