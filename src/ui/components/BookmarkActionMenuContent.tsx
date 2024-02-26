import { Fragment, useMemo } from "react"
import { MenuItem, Divider, Typography } from "@mui/material"
import copyToClipboard from "copy-to-clipboard"

import { BookmarkTreeNode } from "../types"
import { setHashParam } from "../utils/hashParams"
import { isNodeBookmark, removeBookmarks, pasteBookmarks, getChildBookmarks, isNodeFolder } from "../utils/bookmark"
import {
    useStore,
    openBookmarkEditModal,
    clearSelectedBookmarkNodes,
    setCopiedBookmarkNodes,
    setSnackbarMessage,
} from "../store"

export default function BookmarkActionMenuContent({ onCloseMenu }: { onCloseMenu: () => void }) {
    const activeFolder = useStore(state => state.activeFolder)
    const search = useStore(state => state.search)
    const duplicatedBookmarks = useStore(state => state.duplicatedBookmarks)
    const selectedNodes = useStore(state => state.selectedBookmarkNodes)
    const copiedNodes = useStore(state => state.copiedBookmarkNodes)

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
                        openBookmarkEditModal(selectedNodes[0])
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
                    clearSelectedBookmarkNodes(`${selectedNodes.length} items deleted`)
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
                    removeBookmarks(selectedNodes)
                    setCopiedBookmarkNodes(selectedNodes, `${selectedNodes.length} items cut`)
                }}
            >
                Cut
            </MenuItem>
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    onCloseMenu()
                    copyToClipboard(selectedNodes.map(node => node.url ?? node.title).join("\t\n"))
                    setCopiedBookmarkNodes(selectedNodes, `${selectedNodes.length} items copied`)
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
                        setSnackbarMessage("URL copied")
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
