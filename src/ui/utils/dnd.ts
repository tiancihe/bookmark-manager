import { DropTargetMonitor } from "react-dnd"

export interface HandleHoverAndDropSpec {
    node: HTMLElement
    monitor: DropTargetMonitor
    top?: () => void
    mid?: () => void
    bottom?: () => void
}

export function handleHoverAndDrop({ node, monitor, top, mid, bottom }: HandleHoverAndDropSpec) {
    const rect = node.getBoundingClientRect()
    const pos = monitor.getClientOffset()
    if (pos && pos.x > rect.left && pos.x < rect.right && pos.y > rect.top && pos.y < rect.bottom) {
        const topMid = rect.top + rect.height / 3
        const midBottom = rect.bottom - rect.height / 3
        if (pos.y < topMid && top) {
            top()
        } else if (pos.y < midBottom && mid) {
            mid()
        } else if (bottom) {
            bottom()
        }
    }
}
