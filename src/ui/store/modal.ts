import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { BookmarkTreeNode } from "../../types"
import { BookmarkNodeType, ModalType } from "../types"

const slice = createSlice({
    name: "modal",
    initialState: {
        modalType: null as ModalType | null,
        /** exists when modalType === ModalType.BookmarkEdit */
        bookmarkNode: null as BookmarkTreeNode | null,
        /** exists when modalType === ModalType.BookmarkCreate */
        createType: null as BookmarkNodeType | null
    },
    reducers: {
        openBookmarkEditModal(
            state,
            { payload }: PayloadAction<BookmarkTreeNode>
        ) {
            state.modalType = ModalType.BookmarkEdit
            state.bookmarkNode = payload
        },
        openBookmarkCreateModal(
            state,
            { payload }: PayloadAction<BookmarkNodeType>
        ) {
            state.modalType = ModalType.BookmarkCreate
            state.createType = payload
        },
        closeModal(state) {
            state.modalType = null
            state.bookmarkNode = null
            state.createType = null
        }
    }
})

export const {
    closeModal,
    openBookmarkEditModal,
    openBookmarkCreateModal
} = slice.actions

export const modal = slice.reducer
