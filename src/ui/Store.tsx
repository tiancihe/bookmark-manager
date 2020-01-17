import React, {
    createContext,
    useReducer,
    useContext,
    useEffect,
    useMemo
} from "react"
import qs from "query-string"

import { BookmarkTreeNode } from "../types"
import { HoverState } from "./types"

const INIT_STORE = {
    darkMode: false,
    bookmarkTree: null as BookmarkTreeNode | null,
    activeFolderId: "",
    searchInput: "",
    draggingNode: null as BookmarkTreeNode | null,
    hoverState: {} as HoverState
}

enum ActionType {
    ToggleDarkMode = "ToggleDarkMode",
    LoadTree = "LoadTree",
    SetActiveFolder = "SetActiveFolder",
    Search = "Search",
    SetDraggingNode = "SetDraggingNode",
    SetHoverState = "SetHoverState"
}

type Action =
    | {
          type: ActionType.ToggleDarkMode
      }
    | {
          type: ActionType.LoadTree
          payload: Pick<Store, "bookmarkTree">
      }
    | {
          type: ActionType.SetActiveFolder
          payload: Pick<Store, "activeFolderId">
      }
    | {
          type: ActionType.Search
          payload: Pick<Store, "searchInput">
      }
    | {
          type: ActionType.SetDraggingNode
          payload: Pick<Store, "draggingNode">
      }
    | {
          type: ActionType.SetHoverState
          payload: Pick<Store, "hoverState">
      }

const reducer: (store: Store, action: Action) => Store = (store, action) => {
    if (__DEV__) {
        console.log("action:")
        console.log(action)
    }

    switch (action.type) {
        case ActionType.ToggleDarkMode:
            return {
                ...store,
                darkMode: !store.darkMode
            }
        case ActionType.LoadTree:
        case ActionType.Search:
        case ActionType.SetDraggingNode:
        case ActionType.SetHoverState:
            return {
                ...store,
                ...action.payload
            }
        case ActionType.SetActiveFolder:
            return {
                ...store,
                ...action.payload,
                searchInput: ""
            }
        default:
            return store
    }
}

type BookmarkMap = { [key: string]: BookmarkTreeNode }

type Store = typeof INIT_STORE & {
    activeFolder: BookmarkTreeNode
    bookmarkMap: BookmarkMap
    bookmarkList: BookmarkTreeNode[]
    searchResult: BookmarkTreeNode[]

    toggleDarkMode: () => void
    setDraggingNode: (node: BookmarkTreeNode | null) => void
    setHoverState: (state: HoverState) => void
    setActiveFolder: (id: string) => void
    search: (search: string) => void
}

const StoreContext = createContext({} as Store)

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [store, dispatch] = useReducer(reducer, INIT_STORE as Store)

    useEffect(() => {
        const loadTree = async () => {
            dispatch({
                type: ActionType.LoadTree,
                payload: {
                    bookmarkTree: (await browser.bookmarks.getTree())[0]
                }
            })
        }
        loadTree()

        browser.bookmarks.onCreated.addListener(loadTree)
        browser.bookmarks.onChanged.addListener(loadTree)
        browser.bookmarks.onRemoved.addListener(loadTree)
        browser.bookmarks.onMoved.addListener(loadTree)

        return () => {
            browser.bookmarks.onCreated.removeListener(loadTree)
            browser.bookmarks.onChanged.removeListener(loadTree)
            browser.bookmarks.onRemoved.removeListener(loadTree)
            browser.bookmarks.onMoved.removeListener(loadTree)
        }
    }, [])

    const { bookmarkMap, bookmarkList } = useMemo(() => {
        const map: { [key: string]: BookmarkTreeNode } = {}
        const list: BookmarkTreeNode[] = []

        const { bookmarkTree } = store

        if (bookmarkTree) {
            const iterate = (node: BookmarkTreeNode) => {
                if (node) {
                    map[node.id] = node
                    list.push(node)

                    if (node.children) {
                        node.children.forEach(iterate)
                    }
                }
            }
            iterate(bookmarkTree)
        }

        return { bookmarkMap: map, bookmarkList: list }
    }, [store.bookmarkTree])

    const setActiveFolder = (id: BookmarkTreeNode["id"]) => {
        location.hash = encodeURIComponent(
            qs.stringify({
                ...qs.parse(decodeURIComponent(location.hash)),
                folder: id
            })
        )
        dispatch({
            type: ActionType.SetActiveFolder,
            payload: {
                activeFolderId: id
            }
        })
    }

    const searchResult = useMemo(() => {
        if (!store.searchInput) {
            return []
        }

        const reg = new RegExp(store.searchInput, "gi")

        return bookmarkList.filter(bookmark => reg.test(bookmark.title))
    }, [bookmarkList, store.searchInput])

    const search = (title: string) => {
        location.hash = encodeURIComponent(
            qs.stringify({
                ...qs.parse(decodeURIComponent(location.hash)),
                search: title
            })
        )
        dispatch({
            type: ActionType.Search,
            payload: {
                searchInput: title
            }
        })
    }

    const resolvedStore: Store = {
        ...store,
        activeFolder: bookmarkMap[store.activeFolderId],
        bookmarkMap,
        bookmarkList,
        toggleDarkMode: () => dispatch({ type: ActionType.ToggleDarkMode }),
        setActiveFolder,
        search,
        searchResult,
        setDraggingNode: node =>
            dispatch({
                type: ActionType.SetDraggingNode,
                payload: { draggingNode: node }
            }),
        setHoverState: state => {
            // only set hover state for items other than the dragging one
            if (
                !store.draggingNode ||
                (state.node && state.node.id === store.draggingNode.id)
            )
                return

            dispatch({
                type: ActionType.SetHoverState,
                payload: { hoverState: state }
            })
        }
    }

    if (__DEV__) {
        console.log("store:")
        console.log(resolvedStore)
    }

    useEffect(() => {
        const { search: title, folder } = qs.parse(
            decodeURIComponent(location.hash)
        ) as {
            search: string
            folder: string
        }

        if (search) {
            search(title)
        }

        if (folder) {
            setActiveFolder(folder)
        }
    }, [])

    return (
        <StoreContext.Provider value={resolvedStore}>
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => useContext(StoreContext)
