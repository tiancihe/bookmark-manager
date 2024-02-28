import { create } from "zustand"
import { combine } from "zustand/middleware"
import naturalCompare from "natural-compare"

import {
    BookmarkNodeType,
    BookmarkTreeNode,
    ModalType,
    Settings,
} from "../types"
import { getHashParams } from "../utils/hashParams"
import { SETTINGS_KEY } from "../consts"

export const useStore = create(
    combine(
        {
            loadingSettings: true,
            settings: {
                darkMode: false,
                disableFavicon: false,
                alwaysShowURL: false,
                splitterPosition: 256,
            } as Settings,
            bookmarkTree: null as BookmarkTreeNode | null,
            bookmarkMap: {} as Record<string, BookmarkTreeNode>,
            bookmarkList: [] as BookmarkTreeNode[],
            activeFolder: null as BookmarkTreeNode | null,
            search: "",
            searchResult: [] as BookmarkTreeNode[],
            duplicatedBookmarks: [] as BookmarkTreeNode[],
            selectedBookmarkNodes: [] as BookmarkTreeNode[],
            copiedBookmarkNodes: [] as BookmarkTreeNode[],
            snackbar: {
                message: "",
                showUndoAction: false,
            },
            bookmarkEditModal: {
                modalType: null as ModalType | null,
                /** exists when type === ModalType.BookmarkEdit */
                bookmarkNode: null as BookmarkTreeNode | null,
                /** exists when type === ModalType.BookmarkCreate */
                createType: null as BookmarkNodeType | null,
            },
        },
        () => ({}),
    ),
)

if (__DEV__) {
    // @ts-ignore
    window.__STORE__ = useStore
}

export const loadSettings = async () => {
    try {
        const settings = (await browser.storage.local.get(SETTINGS_KEY))[
            SETTINGS_KEY
        ] as Settings
        if (settings) {
            useStore.setState({ loadingSettings: false, settings })
            return
        }
        throw settings
    } catch (err) {
        console.log("load settings failed", err)
        // load settings failed, fallback to use default settings
        useStore.setState({ loadingSettings: false })
    }
}

export const setSettings = (settings: Partial<Settings>) => {
    useStore.setState({
        settings: {
            ...useStore.getState().settings,
            ...settings,
        },
    })
}

export const loadBookmarkTree = async () => {
    const tree = (await browser.bookmarks.getTree())[0]
    const map: Record<string, BookmarkTreeNode> = {}
    const list: BookmarkTreeNode[] = []
    if (tree) {
        const iterate = (node: BookmarkTreeNode) => {
            if (node) {
                map[node.id] = node
                list.push(node)

                if (node.children) {
                    node.children.forEach(iterate)
                }
            }
        }
        iterate(tree)
    }
    useStore.setState({
        bookmarkTree: tree,
        bookmarkMap: map,
        bookmarkList: list,
    })
}

export const syncStateFromHashParams = async () => {
    const { search = "", folder, dedupe } = getHashParams()
    const { bookmarkMap, bookmarkList } = useStore.getState()

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

    useStore.setState({
        search,
        searchResult,
        activeFolder: folder ? bookmarkMap[folder] : null,
        duplicatedBookmarks: dedupe ? findDuplicatedBookmarks() : [],
        // when hash params change, selected bookmarks should also be cleared
        selectedBookmarkNodes: [],
    })
}

export const setSelectedBookmarkNodes = (nodes: BookmarkTreeNode[]) => {
    useStore.setState({ selectedBookmarkNodes: nodes })
}

export const clearSelectedBookmarkNodes = () => {
    useStore.setState({ selectedBookmarkNodes: [] })
}

export const setCopiedBookmarkNodes = (nodes: BookmarkTreeNode[]) => {
    useStore.setState({ copiedBookmarkNodes: nodes })
}

export const clearCopiedBookmarkNodes = () => {
    useStore.setState({ copiedBookmarkNodes: [] })
}

export const setSnackbarMessage = (
    message: string,
    showUndoAction: boolean,
) => {
    useStore.setState({
        snackbar: { message, showUndoAction },
    })
}

export const clearSnackbarMessage = () => {
    useStore.setState({ snackbar: { message: "", showUndoAction: false } })
}

export const openBookmarkEditModal = (node: BookmarkTreeNode) => {
    useStore.setState({
        bookmarkEditModal: {
            modalType: ModalType.BookmarkEdit,
            bookmarkNode: node,
            createType: null,
        },
    })
}

export const openBookmarkCreateModal = (createType: BookmarkNodeType) => {
    useStore.setState({
        bookmarkEditModal: {
            modalType: ModalType.BookmarkCreate,
            bookmarkNode: null,
            createType,
        },
    })
}

export const closeModal = () => {
    useStore.setState({
        bookmarkEditModal: {
            modalType: null,
            bookmarkNode: null,
            createType: null,
        },
    })
}
