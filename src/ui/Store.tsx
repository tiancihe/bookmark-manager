import React, {
    createContext,
    useReducer,
    useContext,
    useEffect,
    useMemo
} from "react"

import { BookmarkTreeNode } from "../types"

const INIT_STORE = {
    bookmarkTree: null as BookmarkTreeNode | null,
    activeFolderId: "",
    searchInput: ""
}

enum ActionType {
    LoadTree = "LoadTree",
    SetActiveFolder = "SetActiveFolder",
    Search = "Search"
}

type Action =
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

const reducer: (store: Store, action: Action) => Store = (store, action) => {
    if (__DEV__) {
        console.log("action:")
        console.log(action)
    }

    switch (action.type) {
        case ActionType.LoadTree:
        case ActionType.Search:
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
        setActiveFolder,
        search,
        searchResult
    }

    if (__DEV__) {
        console.log("store:")
        console.log(resolvedStore)
    }

    return (
        <StoreContext.Provider value={resolvedStore}>
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => useContext(StoreContext)
