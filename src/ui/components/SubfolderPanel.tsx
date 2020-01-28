import React from "react"
import { Paper, Menu, MenuItem } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import { useStore } from "../contexts/store"
import { useModalStore, BookmarkCreateType } from "../contexts/modal"
import { useContextMenu } from "../hooks"

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

const SubfolderPanel: React.FC<{ className?: string }> = ({ className }) => {
    const { activeFolder, searchInput, searchResult } = useStore()

    const { openBookmarkCreateModal } = useModalStore()

    const {
        contextMenuProps,
        closeContextMenu,
        handleContextMenuEvent
    } = useContextMenu()

    const classNames = useSubfolderStyle()

    let content: React.ReactNode = null
    if (searchInput) {
        if (searchResult.length) {
            content = (
                <Paper className={classNames.paper} elevation={3}>
                    {searchResult.map(child => (
                        <BookmarkTreeItem key={child.id} bookmarkNode={child} />
                    ))}
                </Paper>
            )
        } else {
            content = (
                <div className={classNames.emptySearchResults}>
                    No search results found
                </div>
            )
        }
    } else if (
        activeFolder &&
        activeFolder.children &&
        activeFolder.children.length
    ) {
        content = (
            <Paper className={classNames.paper} elevation={3}>
                {activeFolder.children.map(child => (
                    <BookmarkTreeItem key={child.id} bookmarkNode={child} />
                ))}
            </Paper>
        )
    }

    return (
        <div
            className={className}
            onContextMenu={e => {
                handleContextMenuEvent(e)
            }}
        >
            {content}
            <Menu {...contextMenuProps}>
                <MenuItem
                    onClick={() => {
                        openBookmarkCreateModal(BookmarkCreateType.Bookmark)
                        closeContextMenu()
                    }}
                >
                    Add new bookmark
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        openBookmarkCreateModal(BookmarkCreateType.Folder)
                        closeContextMenu()
                    }}
                >
                    Add new folder
                </MenuItem>
            </Menu>
        </div>
    )
}

export default SubfolderPanel
