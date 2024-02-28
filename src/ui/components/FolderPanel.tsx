import { Fragment, useMemo } from "react"
import { Box } from "@mui/material"

import { BookmarkTreeNode } from "../types"
import { isNodeFolder } from "../utils/bookmark"

import FolderTreeItem from "./FolderTreeItem"
import { __FOLDER_PANEL_ID__ } from "../consts"
import { useStore } from "../store"

export default function FolderPanel() {
    const settings = useStore(state => state.settings)
    const bookmarkTree = useStore(state => state.bookmarkTree)
    const bookmarkMap = useStore(state => state.bookmarkMap)
    const activeFolder = useStore(state => state.activeFolder)

    const defaultOpenFolders = useMemo(() => {
        const defaultOpenFolders = {} as Record<string, boolean>
        let current = activeFolder
        const markParent = (child: BookmarkTreeNode) => {
            const parentId = child.parentId
            if (parentId) {
                defaultOpenFolders[parentId] = true
                return bookmarkMap[parentId]
            }
            return null
        }
        while (current) {
            current = markParent(current)
        }
        return defaultOpenFolders
    }, [bookmarkMap, activeFolder])

    const folderTree = useMemo(() => {
        if (!bookmarkTree) return null

        const render = (bookmarkNode: BookmarkTreeNode, level: number) => {
            const children =
                bookmarkNode.children
                    ?.filter(isNodeFolder)
                    ?.map(child => render(child, level + 1)) || null

            return bookmarkNode.title ? (
                <FolderTreeItem
                    key={bookmarkNode.id}
                    bookmarkNode={bookmarkNode}
                    level={level}
                    defaultOpen={defaultOpenFolders[bookmarkNode.id]}
                >
                    {children}
                </FolderTreeItem>
            ) : (
                <Fragment>{children}</Fragment>
            )
        }

        return render(bookmarkTree, -1)
    }, [bookmarkTree, defaultOpenFolders])

    return (
        <Box
            id={__FOLDER_PANEL_ID__}
            sx={{
                width: settings?.splitterPosition || 256,
                height: "100%",
                padding: theme => theme.spacing(2, 0),
                overflow: "auto",
            }}
        >
            {folderTree}
        </Box>
    )
}
