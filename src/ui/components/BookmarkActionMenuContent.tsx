import { Fragment, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { MenuItem, Divider } from "@mui/material"
import copyToClipboard from "copy-to-clipboard"

import { clearSelectedNodes } from "../store/dnd"
import { setCopiedNodes } from "../store/cnp"
import { openBookmarkEditModal } from "../store/modal"
import { showSnackbar } from "../store/snackbar"
import { isNodeBookmark, removeNodes, pasteNodes, getChildBookmarks, isNodeFolder } from "../utils"
import { RootState, BookmarkTreeNode } from "../types"

export default function BookmarkActionMenuContent({ onCloseMenu }: { onCloseMenu: () => void }) {
    const activeFolder = useSelector((state: RootState) => state.bookmark.activeFolder)
    const search = useSelector((state: RootState) => state.bookmark.search)
    const selectedNodes = useSelector((state: RootState) => state.dnd.selectedNodes)
    const copiedNodes = useSelector((state: RootState) => state.cnp.copied)
    const dispatch = useDispatch()

    const selectedBookmarks = useMemo(() => {
        const result = [] as BookmarkTreeNode[]
        for (let i = 0; i < selectedNodes.length; i++) {
            const node = selectedNodes[i]
            if (isNodeBookmark(node)) {
                result.push(node)
            }
            if (isNodeFolder(node)) {
                result.push(...getChildBookmarks(node))
            }
        }
        return result
    }, [selectedNodes])

    return (
        <Fragment>
            {selectedNodes.length === 1 && (
                <MenuItem
                    onClick={e => {
                        e.stopPropagation()
                        onCloseMenu()
                        dispatch(openBookmarkEditModal(selectedNodes[0]))
                    }}
                >
                    {isNodeBookmark(selectedNodes[0]) ? "Edit" : "Rename"}
                </MenuItem>
            )}
            <MenuItem
                onClick={async e => {
                    e.stopPropagation()
                    onCloseMenu()
                    removeNodes(selectedNodes)
                    dispatch(clearSelectedNodes())
                }}
            >
                Delete
            </MenuItem>
            <Divider />
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    onCloseMenu()
                    copyToClipboard(selectedNodes.map(node => node.url ?? node.title).join("\t\n"))
                    dispatch(setCopiedNodes(selectedNodes))
                    dispatch(showSnackbar({ message: `Copied ${selectedNodes.length} items` }))
                }}
            >
                Copy
            </MenuItem>
            {selectedNodes.length === 1 && isNodeBookmark(selectedNodes[0]) && (
                <MenuItem
                    onClick={e => {
                        e.stopPropagation()
                        onCloseMenu()
                        copyToClipboard(selectedNodes[0].url!)
                        dispatch(showSnackbar({ message: "URL copied" }))
                    }}
                >
                    Copy URL
                </MenuItem>
            )}
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    onCloseMenu()
                    // only paste when not searching and a folder opened
                    if (!search && activeFolder) {
                        // paste copied nodes after the last of the selected nodes or append in the children of the current folder
                        const target = selectedNodes[selectedNodes.length - 1]
                        pasteNodes({
                            src: copiedNodes,
                            dest: activeFolder,
                            destIndex: target ? target.index! : undefined,
                        })
                    }
                }}
            >
                Paste
            </MenuItem>
            <Divider />
            <MenuItem
                style={{ width: 230 }}
                onClick={e => {
                    e.stopPropagation()
                    onCloseMenu()
                    selectedBookmarks.forEach(node => {
                        browser.tabs.create({
                            url: node.url,
                            // should open in background by default
                            // this is the default behaviour in chrome's bookmark manager
                            active: false,
                        })
                    })
                }}
            >
                {selectedBookmarks.length > 1 ? (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <span>Open all bookmarks</span>
                        <span>{selectedBookmarks.length}</span>
                    </div>
                ) : (
                    "Open in new tab"
                )}
            </MenuItem>
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    onCloseMenu()
                    browser.windows.create({
                        url: selectedBookmarks.map(bookmark => bookmark.url!),
                    })
                }}
            >
                {selectedNodes.length > 1 ? "Open all in new window" : "Open in new window"}
            </MenuItem>
        </Fragment>
    )
}
