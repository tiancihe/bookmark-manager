import React from "react"
import { throttle } from "lodash"

import { BookmarkTreeNode } from "../../types"

export enum HoverArea {
    Top = "Top",
    Mid = "Mid",
    Bottom = "Bottom"
}

export interface HoverState {
    node: BookmarkTreeNode
    area: HoverArea
}

export interface DndStore {
    selectedNodes: BookmarkTreeNode[]
    isNodeSelected: (node: BookmarkTreeNode) => boolean
    setSelectedNodes: (nodes: BookmarkTreeNode[]) => void
    clearSelectedNodes: () => void

    hoverState: HoverState | null
    isNodeHovered: (node: BookmarkTreeNode) => boolean
    setHoverState: (state: HoverState) => void
    clearHoverState: () => void
}

const DndContext = React.createContext({} as DndStore)

export function DndStoreProvider({ children }: React.PropsWithChildren<{}>) {
    const [selectedNodes, _setSelectedNodes] = React.useState(
        [] as BookmarkTreeNode[]
    )

    const isNodeSelected = (node: BookmarkTreeNode) => {
        return !!selectedNodes.find(_node => _node.id === node.id)
    }

    const setSelectedNodes = (nodes: BookmarkTreeNode[]) => {
        _setSelectedNodes(nodes)
    }

    const clearSelectedNodes = () => {
        _setSelectedNodes([])
    }

    const [hoverState, _setHoverState] = React.useState(
        null as HoverState | null
    )

    const isNodeHovered = (node: BookmarkTreeNode) => {
        return !!hoverState && hoverState.node.id === node.id
    }

    const setHoverState = throttle((state: HoverState) => {
        _setHoverState(state)
    }, 300)

    const clearHoverState = () => {
        _setHoverState(null)
    }

    React.useEffect(() => {
        const reset = () => {
            clearSelectedNodes()
            clearHoverState()
        }
        window.addEventListener("click", reset)
        return () => window.removeEventListener("click", reset)
    }, [selectedNodes])

    return (
        <DndContext.Provider
            value={{
                selectedNodes,
                isNodeSelected,
                setSelectedNodes,
                clearSelectedNodes,

                hoverState,
                isNodeHovered,
                setHoverState,
                clearHoverState
            }}
        >
            {children}
        </DndContext.Provider>
    )
}

export function useDndStore() {
    return React.useContext(DndContext)
}
