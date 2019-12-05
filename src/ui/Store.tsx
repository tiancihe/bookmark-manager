import React, { createContext, useReducer, useContext, useEffect } from "react"

import { BookmarkTreeNode } from "../types"

const INIT_STORE = {
    bookmarkTreeNodes: [] as BookmarkTreeNode[]
}

enum ActionType {
    Init = "init"
}

type Action = {
    type: ActionType.Init
    payload: Pick<Store, "bookmarkTreeNodes">
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
            const tree = (await browser.bookmarks.getTree())[0]
            const bookmarkTreeNodes: BookmarkTreeNode[] = []

            const flattenBookmarkTreeNodes = (node: BookmarkTreeNode) => {
                bookmarkTreeNodes.push(node)

                if (node.children) {
                    node.children.forEach(flattenBookmarkTreeNodes)
                }
            }
            flattenBookmarkTreeNodes(tree)

            dispatch({
                type: ActionType.Init,
                payload: {
                    bookmarkTreeNodes
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
