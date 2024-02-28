import { Fragment } from "react"
import { MenuItem, Divider } from "@mui/material"
import copyToClipboard from "copy-to-clipboard"

import { BookmarkTreeNode, BookmarkNodeType } from "../types"
import { removeBookmark } from "../utils/bookmark"
import {
    openBookmarkEditModal,
    setSelectedBookmarkNodes,
    setSnackbarMessage,
} from "../store"
import { setHashParam } from "../utils/hashParams"

export default function FolderTreeItemContextMenuContent({
    bookmarkNode,
    onClose,
}: {
    bookmarkNode: BookmarkTreeNode
    onClose: () => void
}) {
    const childBookmarks =
        bookmarkNode.children?.filter(
            item => item.type === BookmarkNodeType.Bookmark,
        ) ?? []

    return (
        <Fragment>
            <MenuItem
                onClick={() => {
                    openBookmarkEditModal(bookmarkNode)
                    onClose()
                }}
            >
                Rename
            </MenuItem>
            <MenuItem
                onClick={async () => {
                    setHashParam({
                        folder: undefined,
                    })
                    await removeBookmark(bookmarkNode.id)
                    setSnackbarMessage(`${bookmarkNode.title} deleted`, true)
                    onClose()
                }}
            >
                Delete
            </MenuItem>
            <Divider />
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    copyToClipboard(bookmarkNode.title)
                    setSelectedBookmarkNodes([bookmarkNode])
                    setSnackbarMessage(`"${bookmarkNode.title}" copied`, false)
                    onClose()
                }}
            >
                Copy
            </MenuItem>
            <Divider />
            <MenuItem
                style={{ width: 230 }}
                onClick={() => {
                    childBookmarks.forEach(bookmark => {
                        browser.tabs.create({
                            url: bookmark.url,
                        })
                    })
                    onClose()
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <span>Open all bookmarks</span>
                    <span>{childBookmarks.length}</span>
                </div>
            </MenuItem>
            <MenuItem
                onClick={() => {
                    browser.windows.create({
                        url: childBookmarks.map(bookmark => bookmark.url!),
                    })
                    onClose()
                }}
            >
                Open all in new window
            </MenuItem>
        </Fragment>
    )
}
