import React, { createContext, useReducer, useContext, useEffect } from "react"

import { BookmarkTreeNode } from "../types"

const INIT_STORE = {
    bookmarkTree: null as BookmarkTreeNode | null
}

enum ActionType {
    Init = "init"
}

type Action = {
    type: ActionType.Init
    payload: Pick<Store, "bookmarkTree">
}

const reducer: (store: Store, action: Action) => Store = (store, action) => {
    switch (action.type) {
        case ActionType.Init:
            return {
                ...store,
                ...action.payload
            }
        default:
            return store
    }
}

type Store = typeof INIT_STORE & {}

const StoreContext = createContext({} as Store)

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [store, dispatch] = useReducer(reducer, INIT_STORE)

    useEffect(() => {
        const init = async () => {
            dispatch({
                type: ActionType.Init,
                payload: {
                    bookmarkTree: (await browser.bookmarks.getTree())[0]
                }
            })
        }

        init()
    }, [])

    return (
        <StoreContext.Provider value={{ ...store }}>
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => useContext(StoreContext)
