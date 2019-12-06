import React, { createContext, useReducer, useContext, useEffect } from "react"

import { BookmarkTreeNode } from "../types"

const INIT_STORE = {
    bookmarkTree: null as BookmarkTreeNode | null,
    activeFolder: null as BookmarkTreeNode | null
}

enum ActionType {
    LoadTree = "LoadTree",
    SetActiveFolder = "SetActiveFolder",
    Reload = "Reload"
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

const reducer: (store: Store, action: Action) => Store = (store, action) => {
    console.log("action:")
    console.log(action)
    switch (action.type) {
        case ActionType.LoadTree:
        case ActionType.SetActiveFolder:
        case ActionType.Reload:
            return {
                ...store,
                ...action.payload
            }
        default:
            return store
    }
}

type Store = typeof INIT_STORE & {
    setActiveFolder: (bookmarkNode: BookmarkTreeNode) => void
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
    }, [store])

    const setActiveFolder = (bookmarkNode: BookmarkTreeNode) =>
        dispatch({
            type: ActionType.SetActiveFolder,
            payload: {
                activeFolder: bookmarkNode
            }
        })

    return (
        <StoreContext.Provider value={{ ...store, setActiveFolder }}>
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => useContext(StoreContext)
