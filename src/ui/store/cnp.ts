import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { BookmarkTreeNode } from "../types"

export const slice = createSlice({
    name: "CopyAndPaste",
    initialState: {
        copied: [] as BookmarkTreeNode[],
    },
    reducers: {
        setCopiedNodes(state, { payload }: PayloadAction<BookmarkTreeNode[]>) {
            state.copied = payload
        },
        clearCopiedNodes(state) {
            state.copied = []
        },
    },
})

export const { setCopiedNodes, clearCopiedNodes } = slice.actions

export const cnp = slice.reducer
