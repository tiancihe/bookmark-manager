import React from "react"
import { useDispatch } from "react-redux"
import { MenuItem, Divider } from "@material-ui/core"

import { openBookmarkEditModal } from "../store/modal"
import { showSnackbar } from "../store/snackbar"
import { BookmarkTreeNode, BookmarkNodeType } from "../types"
import { setHashParam } from "../utils"

export default function FolderTreeItemContextMenuContent({
    bookmarkNode,
    onClose
}: {
    bookmarkNode: BookmarkTreeNode
    onClose: () => void
}) {
    const dispatch = useDispatch()

    const childBookmarks = bookmarkNode.children?.filter(item => item.type === BookmarkNodeType.Bookmark) ?? []

    return (
        <React.Fragment>
            <MenuItem
                onClick={() => {
                    dispatch(openBookmarkEditModal(bookmarkNode))
                    onClose()
                }}
            >
                Rename
            </MenuItem>
            <MenuItem
                onClick={() => {
                    setHashParam({ folder: bookmarkNode.parentId })
                    browser.bookmarks.removeTree(bookmarkNode.id).catch(() => {
                        dispatch(showSnackbar({ message: `Can not delete folder: ${bookmarkNode.title}` }))
                    })
                    onClose()
                }}
            >
                Delete
            </MenuItem>
            <Divider />
            <MenuItem
                style={{ width: 230 }}
                onClick={() => {
                    childBookmarks.forEach(bookmark => {
                        browser.tabs.create({
                            url: bookmark.url
                        })
                    })
                    onClose()
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <span>Open all bookmarks</span>
                    <span>{childBookmarks.length}</span>
                </div>
            </MenuItem>
            <MenuItem
                onClick={() => {
                    browser.windows.create({
                        url: childBookmarks.map(bookmark => bookmark.url!)
                    })
                    onClose()
                }}
            >
                Open all in new window
            </MenuItem>
        </React.Fragment>
    )
}
