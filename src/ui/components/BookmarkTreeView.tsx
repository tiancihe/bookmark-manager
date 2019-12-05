import React, { useMemo } from "react"
import { Paper } from "@material-ui/core"
import { TreeView } from "@material-ui/lab"

import { useStore } from "../Store"
import { BookmarkTreeNode } from "../../types"

import BookmarkTreeItem from "./BookmarkTreeItem"

const BookmarkTreeView: React.FC = () => {
    const store = useStore()

    const { bookmarkTree } = store

    if (!bookmarkTree) {
        return null
    }

    const view = useMemo(() => {
        let renderResult = null as React.ReactElement | null

        const renderBookmark = (
            bookmarkNode: BookmarkTreeNode,
            parent: React.ReactElement | null
        ) => {
            const elm = <BookmarkTreeItem bookmarkNode={bookmarkNode} />

            if (bookmarkNode.children) {
                bookmarkNode.children.forEach(child =>
                    renderBookmark(child, elm)
                )
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
        renderBookmark(bookmarkTree, renderResult)

        return renderResult
    }, [bookmarkTree])

    return (
        <Paper style={{ padding: 16 }}>
            <TreeView>{view}</TreeView>
        </Paper>
    )
}

export default BookmarkTreeView
