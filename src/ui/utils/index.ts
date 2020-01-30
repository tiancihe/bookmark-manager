import qs from "query-string"

import { BookmarkTreeNode } from "../../types"
import { HoverState } from "../types"

export function getHashParams() {
    return qs.parse(decodeURIComponent(location.hash))
}

export function setHashParam(payload: Record<string, string>) {
    location.hash = encodeURIComponent(
        qs.stringify({
            ...getHashParams(),
            ...payload
        })
    )
}

/** Resolves website favicon url using google's service */
export function getFavicon(url: string) {
    if (!url) return url
    return (
        "http://www.google.com/s2/favicons?domain_url=" +
        encodeURIComponent(new URL(url).origin)
    )
}

export function isNodeSelected(
    node: BookmarkTreeNode,
    selectedNodes: BookmarkTreeNode[]
) {
    return selectedNodes.findIndex(_node => _node.id === node.id) >= 0
}

export function isNodeHovered(
    node: BookmarkTreeNode,
    hoverState: HoverState | null
) {
    return hoverState !== null && node.id === hoverState.node.id
}
