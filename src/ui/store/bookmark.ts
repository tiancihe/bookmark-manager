import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import qs from "query-string"

import { BookmarkTreeNode } from "../../types"
import { AppThunkAction } from "../types"
import { setHashParam } from "../utils"

const slice = createSlice({
    name: "bookmark",
    initialState: {
        bookmarkTree: null as BookmarkTreeNode | null,
        bookmarkMap: {} as Record<string, BookmarkTreeNode>,
        bookmarkList: [] as BookmarkTreeNode[],
        activeFolder: null as BookmarkTreeNode | null,
        search: "",
        searchResult: [] as BookmarkTreeNode[]
    },
    reducers: {
        setBookmarkTree: (
            state,
            { payload }: PayloadAction<BookmarkTreeNode>
        ) => {
            const map: Record<string, BookmarkTreeNode> = {}
            const list: BookmarkTreeNode[] = []
            if (payload) {
                const iterate = (node: BookmarkTreeNode) => {
                    if (node) {
                        map[node.id] = node
                        list.push(node)

                        if (node.children) {
                            node.children.forEach(iterate)
                        }
                    }
                }
                iterate(payload)
            }
            state.bookmarkTree = payload
            state.bookmarkMap = map
            state.bookmarkList = list

            const { search, folder } = qs.parse(
                decodeURIComponent(location.hash)
            ) as {
                search: string
                folder: string
            }
            if (search) {
                state.search = search
                state.searchResult = state.searchResult.map(
                    node => state.bookmarkMap[node.id]
                )
            }
            if (folder) {
                state.activeFolder = state.bookmarkMap[folder]
            }
        },
        setActiveFolder: (
            state,
            { payload }: PayloadAction<{ id: string; isUserAction?: boolean }>
        ) => {
            const { id, isUserAction = true } = payload
            setHashParam({ folder: id })
            state.activeFolder = state.bookmarkMap[id]
            if (isUserAction) {
                state.search = ""
                state.searchResult = []
                setHashParam({ search: "" })
            }
        },
        setSearch: (
            state,
            {
                payload
            }: PayloadAction<{ search: string; result: BookmarkTreeNode[] }>
        ) => {
            state.search = payload.search
            state.searchResult = payload.result.map(
                node => state.bookmarkMap[node.id]
            )
        }
    }
})

export const { setBookmarkTree, setActiveFolder, setSearch } = slice.actions

export const bookmark = slice.reducer

export function loadBookmarkTree(): AppThunkAction {
    return async function(dispatch) {
        dispatch(setBookmarkTree((await browser.bookmarks.getTree())[0]))
    }
}

export function searchBookmark(search: string): AppThunkAction {
    return async function(dispatch) {
        setHashParam({ search })
        dispatch(
            setSearch({
                search,
                result: search ? await browser.bookmarks.search(search) : []
            })
        )
    }
}
