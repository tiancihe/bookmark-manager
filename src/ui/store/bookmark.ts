import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { BookmarkTreeNode } from "../../types"
import { AppThunkAction } from "../types"
import { setHashParam } from "../utils"

const slice = createSlice({
    name: "bookmark",
    initialState: {
        bookmarkTree: null as BookmarkTreeNode | null,
        activeFolder: null as BookmarkTreeNode | null,
        search: "",
        searchResult: [] as BookmarkTreeNode[]
    },
    reducers: {
        setBookmarkTree: (
            state,
            { payload }: PayloadAction<BookmarkTreeNode>
        ) => {
            state.bookmarkTree = payload
        },
        setActiveFolder: (
            state,
            { payload }: PayloadAction<BookmarkTreeNode>
        ) => {
            state.activeFolder = payload
            setHashParam({ folder: payload.id })
        },
        setSearch: (state, { payload }: PayloadAction<string>) => {
            state.search = payload
        },
        setSearchResult: (
            state,
            { payload }: PayloadAction<BookmarkTreeNode[]>
        ) => {
            state.searchResult = payload
        }
    }
})

export const {
    setBookmarkTree,
    setActiveFolder,
    setSearch,
    setSearchResult
} = slice.actions

export const bookmark = slice.reducer

export function loadBookmarkTree(): AppThunkAction {
    return async function(dispatch) {
        dispatch(setBookmarkTree((await browser.bookmarks.getTree())[0]))
    }
}

export function searchBookmark(search: string): AppThunkAction {
    return async function(dispatch) {
        dispatch(setSearch(search))
        setHashParam({ search })
        dispatch(
            setSearchResult(
                search ? await browser.bookmarks.search(search) : []
            )
        )
    }
}
