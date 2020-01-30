import React from "react"
import { useSelector } from "react-redux"

import { BookmarkTreeNode } from "../../types"
import { RootState } from "../types"

import FolderTreeItem from "./FolderTreeItem"

export default function FolderPanel({ className }: { className?: string }) {
    const bookmarkTree = useSelector(
        (state: RootState) => state.bookmark.bookmarkTree
    )

    const folderTree = React.useMemo(() => {
        if (!bookmarkTree) return null

        let renderResult = null as React.ReactElement | null

        const renderFolder = (
            bookmarkNode: BookmarkTreeNode,
            parent: React.ReactElement | null,
            level: number
        ) => {
            const elm = (
                <FolderTreeItem bookmarkNode={bookmarkNode} level={level} />
            )

            if (bookmarkNode.children) {
                bookmarkNode.children
                    .filter(child => child.type === "folder")
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
    }, [bookmarkTree])

    return <div className={className}>{folderTree}</div>
}
