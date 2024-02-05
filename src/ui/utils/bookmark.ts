import { BatchingUpdateManager } from "../consts"
import { BookmarkTreeNode } from "../types"

export async function moveNodesUnderParent(nodes: BookmarkTreeNode[], parent: BookmarkTreeNode) {
    if (nodes.length === 1 && nodes[0].id === parent.id) return
    BatchingUpdateManager.beginBatchingUpdate()
    for (let i = 0; i < nodes.length; i++) {
        await browser.bookmarks.move(nodes[i].id, {
            parentId: parent.id,
        })
    }
    BatchingUpdateManager.endBatchingUpdate()
}

export async function moveNodesAboveTarget(nodes: BookmarkTreeNode[], target: BookmarkTreeNode) {
    if (nodes.length === 1 && nodes[0].id === target.id) return
    BatchingUpdateManager.beginBatchingUpdate()
    const children = await browser.bookmarks.getChildren(target.parentId!)!
    // splice out nodes to be moved
    for (let i = 0; i < nodes.length; i++) {
        children.splice(
            children.findIndex(node => node.id === nodes[i].id),
            1,
        )
    }
    // put nodes to be moved to the right position
    children.splice(
        children.findIndex(node => node.id === target.id),
        0,
        ...nodes,
    )
    for (let i = 0; i < children.length; i++) {
        if (children[i].index !== i) {
            await browser.bookmarks.move(children[i].id, {
                parentId: target.parentId,
                index: i,
            })
        }
    }
    BatchingUpdateManager.endBatchingUpdate()
}

export async function moveNodesBelowTarget(nodes: BookmarkTreeNode[], target: BookmarkTreeNode) {
    if (nodes.length === 1 && nodes[0].id === target.id) return
    BatchingUpdateManager.beginBatchingUpdate()
    const children = await browser.bookmarks.getChildren(target.parentId!)!
    // splice out nodes to be moved
    for (let i = 0; i < nodes.length; i++) {
        children.splice(
            children.findIndex(node => node.id === nodes[i].id),
            1,
        )
    }
    // put nodes to be moved to the right position
    children.splice(children.findIndex(node => node.id === target.id) + 1, 0, ...nodes)
    for (let i = 0; i < children.length; i++) {
        if (children[i].index !== i) {
            await browser.bookmarks.move(children[i].id, {
                parentId: target.parentId,
                index: i,
            })
        }
    }
    BatchingUpdateManager.endBatchingUpdate()
}

export function openTab(url: string) {
    browser.tabs.create({
        url,
        active: true,
    })
}
