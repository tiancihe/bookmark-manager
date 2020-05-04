import { BookmarkTreeNode } from "../types"
import { InternalGlobals } from "../consts"

export async function moveNodesUnderParent(nodes: BookmarkTreeNode[], parent: BookmarkTreeNode) {
    InternalGlobals.isBatchingUpdate = true
    for (let i = 0; i < nodes.length; i++) {
        if (i === nodes.length - 1) InternalGlobals.isBatchingUpdate = false
        await browser.bookmarks.move(nodes[i].id, {
            parentId: parent.id
        })
    }
}

export async function moveNodesAboveTarget(nodes: BookmarkTreeNode[], target: BookmarkTreeNode) {
    InternalGlobals.isBatchingUpdate = true
    for (let i = 0; i < nodes.length; i++) {
        if (i === nodes.length - 1) InternalGlobals.isBatchingUpdate = false
        await browser.bookmarks.move(nodes[i].id, {
            parentId: target.parentId,
            index: target.index! + i
        })
    }
}

export async function moveNodesBelowTarget(nodes: BookmarkTreeNode[], target: BookmarkTreeNode) {
    InternalGlobals.isBatchingUpdate = true
    for (let i = 0; i < nodes.length; i++) {
        if (i === nodes.length - 1) InternalGlobals.isBatchingUpdate = false
        await browser.bookmarks.move(nodes[i].id, {
            parentId: target.parentId,
            index: target.index! + 1 + i
        })
    }
}

export function openTab(url: string) {
    browser.tabs.create({
        url,
        active: true
    })
}
