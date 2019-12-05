import React from "react"
import { styled } from "@material-ui/core"
import { TreeItem } from "@material-ui/lab"
import { Folder, FolderOpen } from "@material-ui/icons"

import { BookmarkTreeNode } from "../../types"

const BookmarkLabel = styled("div")({
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis"
})

const BookmarkTreeItem: React.FC<React.PropsWithChildren<{
    bookmarkNode: BookmarkTreeNode
}>> = ({ bookmarkNode, children }) => {
    if (bookmarkNode.type === "folder") {
        return (
            <TreeItem
                nodeId={bookmarkNode.id}
                expandIcon={<Folder />}
                collapseIcon={<FolderOpen />}
                label={bookmarkNode.title}
            >
                {children}
            </TreeItem>
        )
    }

    if (bookmarkNode.type === "bookmark") {
        return (
            <TreeItem
                nodeId={bookmarkNode.id}
                label={<BookmarkLabel>{bookmarkNode.title}</BookmarkLabel>}
            >
                {children}
            </TreeItem>
        )
    }

    return null
}

export default BookmarkTreeItem
