import naturalCompare from "natural-compare"

import { BatchingUpdateManager } from "../consts"
import { BookmarkNodeType, BookmarkTreeNode } from "../types"
import { createActionHistory } from "./actionHistory"

export const bookmarkActionHistory = createActionHistory<{
    id?: string
    bookmark?: BookmarkTreeNode
    bookmarks?: BookmarkTreeNode[]
}>()

if (__DEV__) {
    // @ts-ignore
    window.__BOOKMARK_ACTION_HISTORY__ = bookmarkActionHistory
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

const _createBookmark: typeof browser.bookmarks.create = async details => {
    const _details: browser.bookmarks.CreateDetails = {
        index: details.index,
        parentId: details.parentId,
        title: details.title,
        url: details.url,
        type: details.type,
    }
    if (__CHROME__) {
        delete _details.type
    }
    const bookmark = await browser.bookmarks.create(_details)
    return bookmark
}

async function _createBookmarkTree(bookmark: BookmarkTreeNode, parentId?: string) {
    const _bookmark = await _createBookmark({ ...bookmark, parentId: parentId || bookmark.parentId })
    if (bookmark.children) {
        await Promise.all(bookmark.children.map(child => _createBookmarkTree(child, _bookmark.id)))
    }
    return _bookmark
}

export const createBookmark: typeof browser.bookmarks.create = async details => {
    const bookmark = await _createBookmark(details)
    let bookmarkId = bookmark.id
    bookmarkActionHistory.record({
        async do() {
            const _bookmark = await _createBookmark(details)
            bookmarkId = _bookmark.id
            return _bookmark
        },
        async undo() {
            await browser.bookmarks.removeTree(bookmarkId)
        },
    })
    return bookmark
}

export const updateBookmark: typeof browser.bookmarks.update = async (id, changes) => {
    const original = (await browser.bookmarks.get(id))[0]
    const bookmark = await browser.bookmarks.update(id, changes)
    bookmarkActionHistory.record({
        async do() {
            await browser.bookmarks.update(id, changes)
        },
        async undo() {
            await browser.bookmarks.update(id, { title: original.title, url: original.url })
        },
    })
    return bookmark
}

export const removeBookmark: typeof browser.bookmarks.removeTree = async id => {
    const bookmark = (await browser.bookmarks.get(id))[0]
    let _bookmark = bookmark
    const remove = async () => {
        await browser.bookmarks.removeTree(_bookmark.id)
    }
    remove()
    bookmarkActionHistory.record({
        do: remove,
        async undo() {
            await BatchingUpdateManager.batchUpdate(async () => {
                _bookmark = await _createBookmark(_bookmark)
            })
        },
    })
}

export async function removeBookmarks(bookmarks: BookmarkTreeNode[]) {
    if (!bookmarks || bookmarks.length === 0) return

    if (bookmarks.length === 1) {
        return await removeBookmark(bookmarks[0].id)
    }

    let _bookmarks = bookmarks

    const remove = async () => {
        await BatchingUpdateManager.batchUpdate(async () => {
            for (let i = 0; i < _bookmarks.length; i++) {
                const node = _bookmarks[i]
                await browser.bookmarks.removeTree(node.id)
            }
        })
    }

    remove()

    bookmarkActionHistory.record({
        do: remove,
        async undo() {
            _bookmarks = await Promise.all(_bookmarks.map(bookmark => _createBookmarkTree(bookmark)))
        },
    })
}

interface PasteBookmarkSpec {
    src: BookmarkTreeNode
    /** folder to paste under */
    dest: BookmarkTreeNode
    /** index to paste after */
    destIndex?: number
}

async function pasteBookmark(spec: PasteBookmarkSpec) {
    return await _createBookmarkTree({
        ...spec.src,
        parentId: spec.dest.id,
        index: spec.destIndex ? spec.destIndex + 1 : undefined,
    })
}

export interface PasteBookmarksSpec extends Omit<PasteBookmarkSpec, "src"> {
    src: BookmarkTreeNode[]
}

export async function pasteBookmarks(spec: PasteBookmarksSpec) {
    const { src, dest, destIndex } = spec
    let bookmarks = src
    const paste = async () => {
        await BatchingUpdateManager.batchUpdate(async () => {
            bookmarks = await Promise.all(
                bookmarks.map((b, i) =>
                    pasteBookmark({
                        src: b,
                        dest,
                        destIndex: destIndex ? destIndex + i : undefined,
                    }),
                ),
            )
        })
    }
    paste()
    bookmarkActionHistory.record({
        do: paste,
        async undo() {
            await Promise.all(bookmarks.map(bookmark => browser.bookmarks.removeTree(bookmark.id)))
        },
    })
}

async function _sortFolderBy(_folder: BookmarkTreeNode, key: "title" | "url") {
    const folder = (await browser.bookmarks.getSubTree(_folder.id))[0]

    if (!isNodeFolder(folder) || !folder.children) return

    // always keeps folders on top
    const subFolders = folder.children.filter(isNodeFolder)
    subFolders.sort((a, b) => naturalCompare(a.title, b.title))

    const bookmarks = folder.children.filter(isNodeBookmark)
    bookmarks.sort((a, b) => naturalCompare(a[key] || "", b[key] || ""))

    const sorted = [...subFolders, ...bookmarks]

    await BatchingUpdateManager.batchUpdate(async () => {
        for (let i = 0; i < sorted.length; i++) {
            const node = sorted[i]
            if (node.index !== i) {
                await browser.bookmarks.move(node.id, {
                    parentId: folder.id,
                    index: i,
                })
            }
        }
    })
}

const sortFolderBy: typeof _sortFolderBy = async (folder, key) => {
    await _sortFolderBy(folder, key)
    bookmarkActionHistory.record({
        info: { bookmark: folder },
        async do() {
            if (!this.info?.bookmark) return
            await _sortFolderBy(this.info.bookmark, "title")
        },
        async undo() {
            if (!this.info?.bookmark?.children) return
            const originalChildren = this.info.bookmark.children
            const folder = (await browser.bookmarks.getSubTree(this.info.bookmark.id))[0]
            // sort back to original sorting indexes
            await BatchingUpdateManager.batchUpdate(async () => {
                if (!folder.children) return
                for (let i = 0; i < folder.children.length; i++) {
                    const node = folder.children[i]
                    const originalIndex = originalChildren.find(child => child.id === node.id)?.index
                    if (node.index !== originalIndex) {
                        await browser.bookmarks.move(node.id, {
                            parentId: folder.id,
                            index: originalIndex,
                        })
                    }
                }
            })
        },
    })
}

export async function sortFolderByName(folder: BookmarkTreeNode) {
    if (!isNodeFolder(folder) || !folder.children) return
    await sortFolderBy(folder, "title")
}

export async function sortFolderByUrl(folder: BookmarkTreeNode) {
    if (!isNodeFolder(folder) || !folder.children) return
    await sortFolderBy(folder, "url")
}

export async function moveBookmarksUnderParent(bookmarks: BookmarkTreeNode[], parent: BookmarkTreeNode) {
    if (bookmarks.length === 1 && bookmarks[0].id === parent.id) return
    const move = async () => {
        await BatchingUpdateManager.batchUpdate(async () => {
            for (let i = 0; i < bookmarks.length; i++) {
                await browser.bookmarks.move(bookmarks[i].id, {
                    parentId: parent.id,
                })
            }
        })
    }
    move()
    bookmarkActionHistory.record({
        do: move,
        async undo() {
            await BatchingUpdateManager.batchUpdate(async () => {
                for (let i = 0; i < bookmarks.length; i++) {
                    const bookmark = bookmarks![i]
                    await browser.bookmarks.move(bookmark.id, {
                        // move bookmark back under original parent
                        parentId: bookmark.parentId,
                        index: bookmark.index,
                    })
                }
            })
        },
    })
}

async function moveBookmarksAt(bookmarks: BookmarkTreeNode[], target: BookmarkTreeNode, position: "above" | "below") {
    if (bookmarks.length === 1 && bookmarks[0].id === target.id) return

    const bookmarkIds = bookmarks.map(b => b.id)
    const originalBookmarks = await browser.bookmarks.getChildren(target.parentId!)!
    const originalBookmarkIndexMap = originalBookmarks.reduce(
        (prev, cur) => {
            prev[cur.id] = cur.index
            return prev
        },
        {} as Record<string, number | undefined>,
    )

    const move = async () => {
        await BatchingUpdateManager.batchUpdate(async () => {
            // get target folder's bookmarks without bookmarks to be moved
            const _bookmarks = (await browser.bookmarks.getChildren(target.parentId!)!).filter(
                bookmark => bookmarkIds.indexOf(bookmark.id) === -1,
            )
            // find target bookmark's index
            const targetBookmarkIndex = _bookmarks.findIndex(node => node.id === target.id)
            // put bookmarks to be moved above or below
            _bookmarks.splice(targetBookmarkIndex + (position === "below" ? 1 : 0), 0, ...bookmarks)
            // reorder bookmarks
            for (let i = 0; i < _bookmarks.length; i++) {
                if (_bookmarks[i].index !== i) {
                    await browser.bookmarks.move(_bookmarks[i].id, {
                        parentId: target.parentId,
                        index: i,
                    })
                }
            }
        })
    }

    move()

    bookmarkActionHistory.record({
        do: move,
        async undo() {
            await BatchingUpdateManager.batchUpdate(async () => {
                // reset all bookmarks' index inside the target folder
                // because after move, all bookmarks' index are reordered that are inside the target folder
                const _bookmarks = await browser.bookmarks.getChildren(target.parentId!)!
                for (let i = 0; i < _bookmarks.length; i++) {
                    const bookmark = _bookmarks[i]
                    if (bookmark.index !== originalBookmarkIndexMap[bookmark.id]) {
                        await browser.bookmarks.move(bookmark.id, {
                            parentId: bookmark.parentId,
                            index: originalBookmarkIndexMap[bookmark.id],
                        })
                    }
                }

                const bookmarksNotInsideTheSameFolder = bookmarks.filter(b => b.parentId !== target.parentId)
                // move all other bookmarks back
                for (let i = 0; i < bookmarksNotInsideTheSameFolder.length; i++) {
                    const bookmark = bookmarksNotInsideTheSameFolder[i]
                    await browser.bookmarks.move(bookmark.id, {
                        parentId: bookmark.parentId,
                        index: originalBookmarkIndexMap[bookmark.id],
                    })
                }
            })
        },
    })
}

export async function moveBookmarksAboveTarget(bookmarks: BookmarkTreeNode[], target: BookmarkTreeNode) {
    moveBookmarksAt(bookmarks, target, "above")
}

export async function moveBookmarksBelowTarget(bookmarks: BookmarkTreeNode[], target: BookmarkTreeNode) {
    moveBookmarksAt(bookmarks, target, "below")
}

export function openTab(url: string) {
    browser.tabs.create({
        url,
        active: true,
    })
}
