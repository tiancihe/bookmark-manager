import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import naturalCompare from "natural-compare"

import { BookmarkTreeNode } from "../types"
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
        searchResult: [] as BookmarkTreeNode[],
        duplicatedBookmarks: [] as BookmarkTreeNode[],
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
                payload,
            }: PayloadAction<{
                duplicatedBookmarks?: BookmarkTreeNode[]
                search?: string
                searchResult?: BookmarkTreeNode[]
                activeFolderId?: string
            }>,
        ) {
            const { duplicatedBookmarks, search, searchResult, activeFolderId } = payload
            state.duplicatedBookmarks = duplicatedBookmarks || []
            state.search = search || ""
            state.searchResult = searchResult || []
            state.activeFolder = activeFolderId ? state.bookmarkMap[activeFolderId] : null
        },
    },
})

const { setBookmarkTree, setState } = slice.actions

export const bookmark = slice.reducer

export function loadBookmarkTree(): AppThunkAction {
    return async function (dispatch) {
        dispatch(setBookmarkTree((await browser.bookmarks.getTree())[0]))
    }
}

export function syncBookmarkStateFromHashParams(): AppThunkAction {
    return async function (dispatch, getState) {
        const { search, folder, dedupe } = getHashParams()
        const {
            bookmark: { bookmarkList },
        } = getState()

        const searchResult = search ? await browser.bookmarks.search(search) : []

        const findDuplicatedBookmarks = () => {
            const countMap = new Map<string, number>()
            bookmarkList.forEach(b => {
                if (b.url) {
                    countMap.set(b.url, (countMap.get(b.url) || 0) + 1)
                }
            })
            const duplicatedUrlSet = new Set<string>()
            for (const [url, count] of countMap) {
                if (count > 1) duplicatedUrlSet.add(url)
            }
            const duplicatedBookmarks = bookmarkList
                .filter(b => b.url && duplicatedUrlSet.has(b.url))
                .sort((a, b) => naturalCompare(a.url || "", b.url || ""))
            return duplicatedBookmarks
        }

        dispatch(
            setState({
                search,
                searchResult,
                activeFolderId: folder,
                duplicatedBookmarks: dedupe ? findDuplicatedBookmarks() : [],
            }),
        )

        // when hash params change, dnd state should also be cleared together
        dispatch(resetDndState())
    }
}
