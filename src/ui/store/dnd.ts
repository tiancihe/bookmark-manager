import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { BookmarkTreeNode } from "../types"

export const slice = createSlice({
    name: "dnd",
    initialState: {
        selectedNodes: [] as BookmarkTreeNode[],
    },
    reducers: {
        resetDndState: state => {
            state.selectedNodes = []
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
    },
})

export const { resetDndState, selectNode, selectNodes, clearSelectedNodes } = slice.actions

export const dnd = slice.reducer
