import { useSelector } from "react-redux"

import { BookmarkTreeNode } from "../../types"
import { RootState } from "../types"

export default function useHoverState() {
    const hoverState = useSelector((state: RootState) => state.dnd.hoverState)

    const isNodeHovered = (node: BookmarkTreeNode) =>
        hoverState !== null && hoverState.node.id === node.id

    return {
        hoverState,
        isNodeHovered
    }
}
