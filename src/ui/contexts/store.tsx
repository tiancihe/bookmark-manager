import React, {
    createContext,
    useReducer,
    useContext,
    useEffect,
    useMemo
} from "react"
import qs from "query-string"

import { BookmarkTreeNode } from "../../types"

const initState = {
    darkMode: false,
    bookmarkTree: null as BookmarkTreeNode | null,
    activeFolderId: "",
    searchInput: "",
    searchResult: [] as BookmarkTreeNode[]
}

enum ActionType {
    ToggleDarkMode = "ToggleDarkMode",
    LoadTree = "LoadTree",
    SetActiveFolder = "SetActiveFolder",
    Search = "Search",
    SetSearchResult = "SetSearchResult"
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
          type: ActionType.SetSearchResult
          payload: Pick<Store, "searchResult">
      }

const reducer: (store: Store, action: Action) => Store = (store, action) => {
    switch (action.type) {
        case ActionType.ToggleDarkMode:
            return {
                ...store,
                darkMode: !store.darkMode
            }
        case ActionType.LoadTree:
        case ActionType.Search:
        case ActionType.SetSearchResult:
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

type Store = typeof initState & {
    activeFolder: BookmarkTreeNode
    bookmarkMap: BookmarkMap
    bookmarkList: BookmarkTreeNode[]
    searchResult: BookmarkTreeNode[]

    toggleDarkMode: () => void
    setActiveFolder: (id: string) => void
    search: (search: string) => void
}

const StoreContext = createContext({} as Store)

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [store, dispatch] = useReducer(reducer, initState as Store)

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

    React.useEffect(() => {
        const updateSearchResult = async () => {
            let result = [] as BookmarkTreeNode[]
            if (store.searchInput) {
                result = await browser.bookmarks.search({
                    query: store.searchInput
                })
            }
            dispatch({
                type: ActionType.SetSearchResult,
                payload: {
                    searchResult: result
                }
            })
        }
        updateSearchResult()
    }, [store.searchInput, store.bookmarkTree])

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
        <StoreContext.Provider
            value={{
                ...store,
                activeFolder: bookmarkMap[store.activeFolderId],
                bookmarkMap,
                bookmarkList,
                toggleDarkMode: () =>
                    dispatch({ type: ActionType.ToggleDarkMode }),
                setActiveFolder,
                search
            }}
        >
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => useContext(StoreContext)