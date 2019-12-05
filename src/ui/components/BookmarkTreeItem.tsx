import React from "react"
import { makeStyles } from "@material-ui/core"
import { TreeItem } from "@material-ui/lab"
import { Folder, FolderOpen } from "@material-ui/icons"

import { BookmarkTreeNode } from "../../types"
import { getFavicon } from "../utils"
import BookmarkActionMenu from "./BookmarkActionMenu"

const useStyle = makeStyles({
    bookmarkItem: {
        display: "flex",
        alignItems: "center"
    },
    bookmarkTitle: {
        flex: 1,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
    },
    bookmarkActionMenu: {
        justifySelf: "flex-end"
    }
})

const BookmarkTreeItem: React.FC<React.PropsWithChildren<{
    bookmarkNode: BookmarkTreeNode
}>> = ({ bookmarkNode, children }) => {
    const classNames = useStyle()

    const isFolder = bookmarkNode.type === "folder"
    const isBookmark = bookmarkNode.type === "bookmark"

    if (isFolder || isBookmark) {
        return (
            <TreeItem
                nodeId={bookmarkNode.id}
                expandIcon={isFolder && <Folder />}
                collapseIcon={isFolder && <FolderOpen />}
                icon={
                    isBookmark && (
                        <img src={getFavicon(bookmarkNode.url || "")} />
                    )
                }
                label={
                    <div className={classNames.bookmarkItem}>
                        <div className={classNames.bookmarkTitle}>
                            {bookmarkNode.title}
                        </div>
                        <div
                            className={classNames.bookmarkActionMenu}
                            onClick={
                                isFolder ? e => e.stopPropagation() : undefined
                            }
                        >
                            <BookmarkActionMenu bookmarkNode={bookmarkNode} />
                        </div>
                    </div>
                }
            >
                {children}
            </TreeItem>
        )
    }

    return null
}

export default BookmarkTreeItem
