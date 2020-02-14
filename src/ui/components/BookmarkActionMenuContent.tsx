import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { MenuItem, Divider } from "@material-ui/core"

import { BookmarkNodeType, RootState } from "../types"
import { clearSelectedNodes } from "../store/dnd"
import { openBookmarkEditModal } from "../store/modal"
import { isNodeBookmark, isNodeFolder } from "../utils"

export default function BookmarkActionMenuContent({
    onCloseMenu
}: {
    onCloseMenu: () => void
}) {
    const selectedNodes = useSelector(
        (state: RootState) => state.dnd.selectedNodes
    )
    const dispatch = useDispatch()

    return (
        <React.Fragment>
            {selectedNodes.length === 1 && (
                <MenuItem
                    onClick={e => {
                        e.stopPropagation()
                        dispatch(openBookmarkEditModal(selectedNodes[0]))
                        onCloseMenu()
                    }}
                >
                    {selectedNodes[0].type === BookmarkNodeType.Bookmark
                        ? "Edit"
                        : "Rename"}
                </MenuItem>
            )}
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    const removeSelectedNodes = async () => {
                        await Promise.all(
                            selectedNodes.map(node => {
                                if (isNodeBookmark(node)) {
                                    browser.bookmarks.remove(node.id)
                                }
                                if (isNodeFolder(node)) {
                                    browser.bookmarks.removeTree(node.id)
                                }
                            })
                        )
                        dispatch(clearSelectedNodes())
                    }
                    removeSelectedNodes()
                }}
            >
                Delete
            </MenuItem>
            <Divider />
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    selectedNodes.filter(isNodeBookmark).forEach(node => {
                        browser.tabs.create({
                            url: node.url
                        })
                    })
                    onCloseMenu()
                }}
            >
                {selectedNodes.length > 1
                    ? "Open all in new tab"
                    : "Open in new tab"}
            </MenuItem>
            <MenuItem
                onClick={e => {
                    e.stopPropagation()

                    browser.windows.create({
                        url: selectedNodes
                            .filter(isNodeBookmark)
                            .map(node => node.url!)
                    })
                    onCloseMenu()
                }}
            >
                {selectedNodes.length > 1
                    ? "Open all in new window"
                    : "Open in new window"}
            </MenuItem>
            {/** @todo Error: Extension does not have permission for incognito mode */}
            {/* <MenuItem
                    onClick={e => {
                        e.stopPropagation()
                        browser.windows.create({
                            url: bookmarkNode.url,
                            incognito: true
                        })
                        onClose()
                    }}
                >
                    Open in incognito window
                </MenuItem> */}
        </React.Fragment>
    )
}
