import qs from "query-string"
import naturalCompare from "natural-compare"

import { BookmarkTreeNode } from "../../types"
import { HashParams, BookmarkNodeType } from "../types"
import { BatchingUpdateManager } from "../consts"

export function getHashParams() {
    return qs.parse(decodeURIComponent(location.hash)) as HashParams
}

export function setHashParam(payload: HashParams) {
    location.hash = encodeURIComponent(
        qs.stringify({
            ...getHashParams(),
            ...payload,
        }),
    )
}

/** Resolves website favicon url using google's service */
export function getFavicon(url: string) {
    if (!url) return url
    if (__CHROME__) {
        /** @see https://developer.chrome.com/docs/extensions/how-to/ui/favicons */
        const _url = new URL(chrome.runtime.getURL("/_favicon/"))
        _url.searchParams.set("pageUrl", url)
        _url.searchParams.set("size", "32")
        return _url.toString()
    }
    return "http://www.google.com/s2/favicons?domain_url=" + encodeURIComponent(new URL(url).origin)
}

export function isNodeSelected(node: BookmarkTreeNode, selectedNodes: BookmarkTreeNode[]) {
    return selectedNodes.findIndex(_node => _node.id === node.id) >= 0
}

export function isNodeBookmark(node: BookmarkTreeNode) {
    return node.type === BookmarkNodeType.Bookmark || !!node.url
}

export function isNodeFolder(node: BookmarkTreeNode) {
    return node.type === BookmarkNodeType.Folder || !node.url
}

export interface PasteNodeSpec {
    src: BookmarkTreeNode
    /** folder to paste under */
    dest: BookmarkTreeNode
    /** index to paste after */
    destIndex?: number
}

export async function pasteNode(spec: PasteNodeSpec) {
    if (isNodeBookmark(spec.src)) {
        await browser.bookmarks.create({
            type: spec.src.type,
            parentId: spec.dest.id,
            index: spec.destIndex ? spec.destIndex + 1 : undefined,
            title: spec.src.title,
            url: spec.src.url,
        })
        return
    }

    if (isNodeFolder(spec.src)) {
        const newFolder = await browser.bookmarks.create({
            type: spec.src.type,
            parentId: spec.dest.id,
            index: spec.destIndex ? spec.destIndex + 1 : undefined,
            title: spec.src.title,
        })

        if (spec.src.children) {
            for (let i = 0; i < spec.src.children.length; i++) {
                const child = spec.src.children[i]
                await pasteNode({
                    src: child,
                    dest: newFolder,
                    destIndex: i,
                })
            }
        }
    }
}

export interface PasteNodesSpec extends Omit<PasteNodeSpec, "src"> {
    src: BookmarkTreeNode[]
}

export async function pasteNodes(spec: PasteNodesSpec) {
    const { src, dest, destIndex } = spec
    BatchingUpdateManager.beginBatchingUpdate()
    for (let i = 0; i < src.length; i++) {
        await pasteNode({
            src: src[i],
            dest,
            destIndex: destIndex ? destIndex + i : undefined,
        })
    }
    BatchingUpdateManager.endBatchingUpdate()
}

export async function removeNodes(nodes: BookmarkTreeNode[]) {
    BatchingUpdateManager.beginBatchingUpdate()
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (isNodeFolder(node)) {
            await browser.bookmarks.removeTree(node.id)
        } else {
            await browser.bookmarks.remove(node.id)
        }
    }
    BatchingUpdateManager.endBatchingUpdate()
}

/** get all child bookmarks under a folder */
export function getChildBookmarks(node: BookmarkTreeNode, accumulator?: BookmarkTreeNode[]) {
    const result = accumulator ?? []
    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i]
            if (isNodeFolder(child)) {
                // depth-first
                getChildBookmarks(child, result)
            }
            if (isNodeBookmark(child)) {
                result.push(child)
            }
        }
    }
    return result
}

export async function sortFolderByName(folder: BookmarkTreeNode) {
    if (folder.children) {
        const subFolders = folder.children.filter(isNodeFolder)
        subFolders.sort((a, b) => naturalCompare(a.title, b.title))

        const bookmarks = folder.children.filter(isNodeBookmark)
        bookmarks.sort((a, b) => naturalCompare(a.title, b.title))

        const sorted = [...subFolders, ...bookmarks]

        BatchingUpdateManager.beginBatchingUpdate()
        for (let i = 0; i < sorted.length; i++) {
            const node = sorted[i]
            if (node.index !== i) {
                await browser.bookmarks.move(node.id, {
                    parentId: folder.id,
                    index: i,
                })
            }
        }
        BatchingUpdateManager.endBatchingUpdate()
    }
}

export async function sortFolderByUrl(folder: BookmarkTreeNode) {
    if (folder.children) {
        // always keeps folders on top
        const subFolders = folder.children.filter(isNodeFolder)
        subFolders.sort((a, b) => naturalCompare(a.title, b.title))

        const bookmarks = folder.children.filter(isNodeBookmark)
        bookmarks.sort((a, b) => naturalCompare(a.url ?? "", b.url ?? ""))

        const sorted = [...subFolders, ...bookmarks]

        BatchingUpdateManager.beginBatchingUpdate()
        for (let i = 0; i < sorted.length; i++) {
            const node = sorted[i]
            if (node.index !== i) {
                await browser.bookmarks.move(node.id, {
                    parentId: folder.id,
                    index: i,
                })
            }
        }
        BatchingUpdateManager.endBatchingUpdate()
    }
}
