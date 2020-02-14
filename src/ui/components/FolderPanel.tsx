import React from "react"
import { useSelector } from "react-redux"

import { BookmarkTreeNode } from "../../types"
import { RootState } from "../types"
import { isNodeFolder } from "../utils"

import FolderTreeItem from "./FolderTreeItem"

export default function FolderPanel({ className }: { className?: string }) {
    const bookmarkTree = useSelector(
        (state: RootState) => state.bookmark.bookmarkTree
    )
    const bookmarkMap = useSelector(
        (state: RootState) => state.bookmark.bookmarkMap
    )
    const activeFolder = useSelector(
        (state: RootState) => state.bookmark.activeFolder
    )

    const defaultOpenFolders = React.useMemo(() => {
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

    const folderTree = React.useMemo(() => {
        if (!bookmarkTree) return null

        let renderResult = null as React.ReactElement | null

        const renderFolder = (
            bookmarkNode: BookmarkTreeNode,
            parent: React.ReactElement | null,
            level: number
        ) => {
            const elm = (
                <FolderTreeItem
                    bookmarkNode={bookmarkNode}
                    level={level}
                    defaultOpen={defaultOpenFolders[bookmarkNode.id]}
                />
            )

            if (bookmarkNode.children) {
                bookmarkNode.children
                    .filter(isNodeFolder)
                    .forEach(child => renderFolder(child, elm, level + 1))
            }

            if (parent) {
                if (parent.props.children) {
                    parent.props.children.push(elm)
                } else {
                    parent.props.children = [elm]
                }
            } else {
                renderResult = (
                    <React.Fragment>{elm.props.children}</React.Fragment>
                )
            }
        }
        renderFolder(bookmarkTree, renderResult, -1)

        return renderResult
    }, [bookmarkTree, defaultOpenFolders])

    return <div className={className}>{folderTree}</div>
}
