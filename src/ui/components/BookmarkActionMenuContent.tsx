import { Fragment, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { MenuItem, Divider, Typography } from "@mui/material"
import copyToClipboard from "copy-to-clipboard"

import { clearSelectedNodes } from "../store/dnd"
import { setCopiedNodes } from "../store/cnp"
import { openBookmarkEditModal } from "../store/modal"
import { setSnackbarMessage } from "../store/message"
import { isNodeBookmark, removeBookmarks, pasteBookmarks, getChildBookmarks, isNodeFolder } from "../utils/bookmark"
import { RootState, BookmarkTreeNode } from "../types"
import { setHashParam } from "../utils"

export default function BookmarkActionMenuContent({ onCloseMenu }: { onCloseMenu: () => void }) {
    const activeFolder = useSelector((state: RootState) => state.bookmark.activeFolder)
    const search = useSelector((state: RootState) => state.bookmark.search)
    const duplicatedBookmarks = useSelector((state: RootState) => state.bookmark.duplicatedBookmarks)
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
            {(search || duplicatedBookmarks.length) && selectedNodes.length === 1 && selectedNodes[0].parentId ? (
                <MenuItem
                    onClick={async e => {
                        e.stopPropagation()
                        onCloseMenu()
                        const activeFolderId = selectedNodes[0].parentId!
                        setHashParam({
                            folder: activeFolderId,
                            search: undefined,
                            dedupe: undefined,
                        })
                        document.getElementById(activeFolderId)?.scrollIntoView()
                        document.getElementById(selectedNodes[0].id)?.scrollIntoView()
                    }}
                >
                    Show in folder
                </MenuItem>
            ) : null}
            {selectedNodes.length === 1 ? (
                <MenuItem
                    onClick={e => {
                        e.stopPropagation()
                        onCloseMenu()
                        dispatch(openBookmarkEditModal(selectedNodes[0]))
                    }}
                >
                    {isNodeBookmark(selectedNodes[0]) ? "Edit" : "Rename"}
                </MenuItem>
            ) : null}
            <MenuItem
                onClick={async e => {
                    e.stopPropagation()
                    onCloseMenu()
                    removeBookmarks(selectedNodes)
                    dispatch(setSnackbarMessage(`${selectedNodes.length} items deleted`))
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
                    removeBookmarks(selectedNodes)
                    dispatch(setSnackbarMessage(`${selectedNodes.length} items cut`))
                }}
            >
                Cut
            </MenuItem>
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    onCloseMenu()
                    copyToClipboard(selectedNodes.map(node => node.url ?? node.title).join("\t\n"))
                    dispatch(setCopiedNodes(selectedNodes))
                    dispatch(setSnackbarMessage(`${selectedNodes.length} items copied`))
                }}
            >
                Copy
            </MenuItem>
            {selectedNodes.length === 1 && isNodeBookmark(selectedNodes[0]) ? (
                <MenuItem
                    onClick={e => {
                        e.stopPropagation()
                        onCloseMenu()
                        copyToClipboard(selectedNodes[0].url!)
                        dispatch(setSnackbarMessage("URL copied"))
                    }}
                >
                    Copy URL
                </MenuItem>
            ) : null}
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    onCloseMenu()
                    // only paste when not searching and a folder opened
                    if (!search && activeFolder) {
                        // paste copied nodes after the last of the selected nodes or append in the children of the current folder
                        const target = selectedNodes[selectedNodes.length - 1]
                        pasteBookmarks({
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
                    <Typography>Open all ({selectedBookmarks.length}) bookmarks</Typography>
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
                {selectedBookmarks.length > 1
                    ? `Open all (${selectedBookmarks.length}) in new window`
                    : "Open in new window"}
            </MenuItem>
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    onCloseMenu()
                    browser.windows.create({
                        url: selectedBookmarks.map(bookmark => bookmark.url!),
                        incognito: true,
                    })
                }}
            >
                {selectedBookmarks.length > 1
                    ? `Open all (${selectedBookmarks.length}) in incognito window`
                    : "Open in incognito window"}
            </MenuItem>
        </Fragment>
    )
}
