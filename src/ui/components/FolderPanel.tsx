import React, { useMemo } from "react"
import { styled } from "@material-ui/core"

import { BookmarkTreeNode } from "../../types"
import { useStore } from "../Store"
import FolderTreeItem from "./FolderTreeItem"

const Panel = styled("div")({
    width: "40vw",
    padding: "8px 4px 0 16px"
})

const FolderPanel: React.FC = () => {
    const { bookmarkTree } = useStore()

    if (!bookmarkTree) return null

    const folderTree = useMemo(() => {
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

    return <Panel>{folderTree}</Panel>
}

export default FolderPanel
