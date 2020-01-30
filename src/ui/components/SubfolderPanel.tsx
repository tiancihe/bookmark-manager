import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Paper, Menu, MenuItem } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import { openBookmarkCreateModal } from "../store/modal"
import { RootState, BookmarkNodeType } from "../types"
import useContextMenu from "../hooks/useContextMenu"

import BookmarkTreeItem from "./BookmarkTreeItem"

const useSubfolderStyle = makeStyles(theme => ({
    paper: {
        width: "100%",
        maxWidth: "960px",
        margin: "auto",
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(3),
        padding: theme.spacing(1, 0)
    },
    emptySearchResults: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        fontSize: theme.typography.h6.fontSize,
        fontWeight: theme.typography.h6.fontWeight,
        color: "#6e6e6e",
        userSelect: "none",
        cursor: "default"
    }
}))

export default function SubfolderPanel({ className }: { className?: string }) {
    const activeFolder = useSelector(
        (state: RootState) => state.bookmark.activeFolder
    )
    const search = useSelector((state: RootState) => state.bookmark.search)
    const searchResult = useSelector(
        (state: RootState) => state.bookmark.searchResult
    )
    const dispatch = useDispatch()

    const {
        contextMenuProps,
        closeContextMenu,
        handleContextMenuEvent
    } = useContextMenu()

    const classNames = useSubfolderStyle()

    return (
        <div
            className={className}
            onContextMenu={e => {
                handleContextMenuEvent(e)
            }}
        >
            {search ? (
                searchResult.length > 0 ? (
                    <Paper className={classNames.paper} elevation={3}>
                        {searchResult.map(child => (
                            <BookmarkTreeItem
                                key={child.id}
                                bookmarkNode={child}
                            />
                        ))}
                    </Paper>
                ) : (
                    <div className={classNames.emptySearchResults}>
                        No search results found
                    </div>
                )
            ) : activeFolder !== null &&
              Array.isArray(activeFolder.children) &&
              activeFolder.children.length > 0 ? (
                <Paper className={classNames.paper} elevation={3}>
                    {activeFolder.children
                        .filter(
                            child =>
                                child.type === BookmarkNodeType.Bookmark ||
                                child.type === BookmarkNodeType.Folder
                        )
                        .map(child => (
                            <BookmarkTreeItem
                                key={child.id}
                                bookmarkNode={child}
                            />
                        ))}
                </Paper>
            ) : null}
            <Menu {...contextMenuProps}>
                <MenuItem
                    onClick={() => {
                        dispatch(
                            openBookmarkCreateModal(BookmarkNodeType.Bookmark)
                        )
                        closeContextMenu()
                    }}
                >
                    Add new bookmark
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        dispatch(
                            openBookmarkCreateModal(BookmarkNodeType.Folder)
                        )
                        closeContextMenu()
                    }}
                >
                    Add new folder
                </MenuItem>
            </Menu>
        </div>
    )
}
