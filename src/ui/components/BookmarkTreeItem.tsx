import React from "react"
import { makeStyles } from "@material-ui/core"
import { FolderTwoTone } from "@material-ui/icons"

import { BookmarkTreeNode } from "../../types"
import { getFavicon } from "../utils"
import BookmarkActionMenu from "./BookmarkActionMenu"

const useBookmarkListItemStyle = makeStyles({
    container: {
        display: "flex",
        alignItems: "center",
        paddingLeft: "24px"
    },
    icon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px"
    },
    title: {
        flex: 1,
        margin: "0 16px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
    },
    actions: {
        justifySelf: "flex-end"
    }
})

const BookmarkTreeItem: React.FC<{
    bookmarkNode: BookmarkTreeNode
}> = ({ bookmarkNode }) => {
    const classNames = useBookmarkListItemStyle()

    const isFolder = bookmarkNode.type === "folder"
    const isBookmark = bookmarkNode.type === "bookmark"

    if (isFolder || isBookmark) {
        return (
            <div className={classNames.container}>
                <div className={classNames.icon}>
                    {isFolder && <FolderTwoTone />}
                    {isBookmark && (
                        <img src={getFavicon(bookmarkNode.url || "")} />
                    )}
                </div>
                <div className={classNames.title}>{bookmarkNode.title}</div>
                <BookmarkActionMenu
                    className={classNames.actions}
                    bookmarkNode={bookmarkNode}
                />
            </div>
        )
    }

    return null
}

export default BookmarkTreeItem
