import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { BookmarkTreeNode } from "../../types"
import { AppThunkAction } from "../types"
import { getHashParams } from "../utils"
import { resetDndState } from "./dnd"

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
        setBookmarkTree(state, { payload }: PayloadAction<BookmarkTreeNode>) {
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
        },
        setState(
            state,
            {
                payload
            }: PayloadAction<{
                search?: string
                searchResult?: BookmarkTreeNode[]
                activeFolderId?: string
            }>
        ) {
            const { search, searchResult, activeFolderId } = payload

            if (search) {
                state.search = search
                state.searchResult = searchResult!
            } else {
                state.search = ""
                state.searchResult = []
            }

            if (activeFolderId) {
                state.activeFolder = state.bookmarkMap[activeFolderId]
            } else {
                state.activeFolder = null
            }
        }
    }
})

export const { setBookmarkTree, setState } = slice.actions

export const bookmark = slice.reducer

export function loadBookmarkTree(): AppThunkAction {
    return async function(dispatch) {
        dispatch(setBookmarkTree((await browser.bookmarks.getTree())[0]))
    }
}

export function syncBookmarkStateFromHashParams(): AppThunkAction {
    return async function(dispatch) {
        const { search = "", folder } = getHashParams()

        const searchResult = search
            ? await browser.bookmarks.search(search)
            : []

        dispatch(
            setState({
                search,
                searchResult,
                activeFolderId: folder
            })
        )

        // when hash params change, dnd state should also be cleared together
        dispatch(resetDndState())
    }
}
