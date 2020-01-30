import { useSelector } from "react-redux"

import { BookmarkTreeNode } from "../../types"
import { RootState } from "../types"

export default function useSelectedNodes() {
    const selectedNodes = useSelector(
        (state: RootState) => state.dnd.selectedNodes
    )

    const isNodeSelected = (node: BookmarkTreeNode) =>
        selectedNodes.findIndex(_node => _node.id === node.id) >= 0

    return {
        selectedNodes,
        isNodeSelected
    }
}
