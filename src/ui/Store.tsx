import React, { createContext, useReducer, useContext, useEffect } from "react"

import { BookmarkTreeNode } from "../types"

const INIT_STORE = {
    bookmarkTree: null as BookmarkTreeNode | null,
    activeFolder: null as BookmarkTreeNode | null
}

enum ActionType {
    LoadTree = "LoadTree",
    SetActiveFolder = "SetActiveFolder"
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

const reducer: (store: Store, action: Action) => Store = (store, action) => {
    console.log(action)
    switch (action.type) {
        case ActionType.LoadTree:
        case ActionType.SetActiveFolder:
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
