import React, {
    createContext,
    useReducer,
    useContext,
    useEffect,
    useMemo,
    useCallback
} from "react"

import { BookmarkTreeNode } from "../types"

const INIT_STORE = {
    bookmarkTree: null as BookmarkTreeNode | null,
    activeFolder: null as BookmarkTreeNode | null,
    searchInput: "",
    searchResult: [] as BookmarkTreeNode[]
}

enum ActionType {
    LoadTree = "LoadTree",
    SetActiveFolder = "SetActiveFolder",
    Reload = "Reload",
    Search = "Search"
}

type Action =
    | {
          type: ActionType.LoadTree
          payload: Pick<Store, "bookmarkTree">
      }
    | {
          type: ActionType.SetActiveFolder
          payload: Pick<Store, "activeFolder">
      }
    | {
          type: ActionType.Reload
          payload: Pick<Store, "bookmarkTree" | "activeFolder">
      }
    | {
          type: ActionType.Search
          payload: Pick<Store, "searchInput" | "searchResult">
      }

const reducer: (store: Store, action: Action) => Store = (store, action) => {
    console.log("action:")
    console.log(action)
    switch (action.type) {
        case ActionType.LoadTree:
        case ActionType.Reload:
            return {
                ...store,
                ...action.payload
            }
        case ActionType.Search:
            return {
                ...store,
                ...action.payload,
                activeFolder: null
            }
        case ActionType.SetActiveFolder:
            return {
                ...store,
                ...action.payload,
                searchResult: []
            }
        default:
            return store
    }
}

type BookmarkMap = { [key: string]: BookmarkTreeNode }

type Store = typeof INIT_STORE & {
    bookmarkMap: BookmarkMap
    bookmarkList: BookmarkTreeNode[]

    setActiveFolder: (bookmarkNode: BookmarkTreeNode) => void

    search: (search: string) => void
}

const StoreContext = createContext({} as Store)

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [store, dispatch] = useReducer(reducer, INIT_STORE as Store)
    console.log("store:")
    console.log(store)

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
    }, [])

    useEffect(() => {
        const listener = async () => {
            const bookmarkTree = (await browser.bookmarks.getTree())[0]
            let activeFolder = store.activeFolder
            if (activeFolder) {
                activeFolder = (
                    await browser.bookmarks.getSubTree(activeFolder.id)
                )[0]
            }
            dispatch({
                type: ActionType.Reload,
                payload: {
                    bookmarkTree,
                    activeFolder
                }
            })
        }

        browser.bookmarks.onCreated.addListener(listener)
        browser.bookmarks.onChanged.addListener(listener)
        browser.bookmarks.onRemoved.addListener(listener)
        browser.bookmarks.onMoved.addListener(listener)

        return () => {
            browser.bookmarks.onCreated.removeListener(listener)
            browser.bookmarks.onChanged.removeListener(listener)
            browser.bookmarks.onRemoved.removeListener(listener)
            browser.bookmarks.onMoved.removeListener(listener)
        }
    }, [store.activeFolder])

    const { bookmarkMap, bookmarkList } = useMemo(() => {
        const map: { [key: string]: BookmarkTreeNode } = {}
        const list: BookmarkTreeNode[] = []
        const { bookmarkTree } = store

        if (bookmarkTree) {
            const iterate = (node: BookmarkTreeNode) => {
                if (node) {
                    map[node.title] = node
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

    const setActiveFolder = (bookmarkNode: BookmarkTreeNode) =>
        dispatch({
            type: ActionType.SetActiveFolder,
            payload: {
                activeFolder: bookmarkNode
            }
        })

    const search = useCallback(
        (title: string) => {
            let searchResult = [] as BookmarkTreeNode[]

            if (title) {
                const reg = new RegExp(title, "gi")

                searchResult = bookmarkList.filter(bookmark =>
                    reg.test(bookmark.title)
                )
            }

            dispatch({
                type: ActionType.Search,
                payload: {
                    searchInput: title,
                    searchResult
                }
            })
        },
        [bookmarkList]
    )

    return (
        <StoreContext.Provider
            value={{
                ...store,
                bookmarkMap,
                bookmarkList,
                setActiveFolder,
                search
            }}
        >
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => useContext(StoreContext)
