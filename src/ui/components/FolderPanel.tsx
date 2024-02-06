import { Fragment, useMemo } from "react"
import { useSelector } from "react-redux"
import { Box } from "@mui/material"

import { BookmarkTreeNode } from "../types"
import { RootState } from "../types"
import { isNodeFolder } from "../utils/bookmark"

import FolderTreeItem from "./FolderTreeItem"
import useSettings from "../hooks/useSettings"
import { __FOLDER_PANEL_ID__ } from "../consts"

export default function FolderPanel() {
    const { settings } = useSettings()
    const bookmarkTree = useSelector((state: RootState) => state.bookmark.bookmarkTree)
    const bookmarkMap = useSelector((state: RootState) => state.bookmark.bookmarkMap)
    const activeFolder = useSelector((state: RootState) => state.bookmark.activeFolder)

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
            const children = bookmarkNode.children?.filter(isNodeFolder)?.map(child => render(child, level + 1)) || null

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
                padding: theme => theme.spacing(2, 1),
                overflow: "auto",
            }}
        >
            {folderTree}
        </Box>
    )
}
