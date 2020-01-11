import { BookmarkTreeNode } from "../types"

export type HoverArea = "top" | "mid" | "bottom" | null

export interface HoverState {
    node: BookmarkTreeNode | null
    area: HoverArea
}
