import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Paper, Menu, MenuItem } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import { openBookmarkCreateModal } from "../store/modal"
import { selectNodes, clearSelectedNodes } from "../store/dnd"
import { RootState, BookmarkNodeType } from "../types"
import { isNodeHovered } from "../utils"
import { __MAC__ } from "../consts"
import useContextMenu from "../hooks/useContextMenu"

import BookmarkTreeItem from "./BookmarkTreeItem"

const useStyle = makeStyles(theme => ({
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

export default function DisplayPanel({ className }: { className?: string }) {
    const activeFolder = useSelector(
        (state: RootState) => state.bookmark.activeFolder
    )
    const search = useSelector((state: RootState) => state.bookmark.search)
    const searchResult = useSelector(
        (state: RootState) => state.bookmark.searchResult
    )
    const selectedNodes = useSelector(
        (state: RootState) => state.dnd.selectedNodes
    )
    const hoverState = useSelector((state: RootState) => state.dnd.hoverState)
    const dispatch = useDispatch()

    const activeFolderChildren = React.useMemo(() => {
        return activeFolder !== null &&
            Array.isArray(activeFolder.children) &&
            activeFolder.children.length > 0
            ? activeFolder.children.filter(
                  child =>
                      child.type === BookmarkNodeType.Bookmark ||
                      child.type === BookmarkNodeType.Folder
              )
            : null
    }, [activeFolder])

    // capture select all hotkey to select all bookmark nodes that are currently displayed
    React.useEffect(() => {
        const selectAllListener = (e: KeyboardEvent) => {
            if (
                e.key === "a" &&
                ((!__MAC__ && e.ctrlKey) || (__MAC__ && e.metaKey))
            ) {
                if (searchResult.length) {
                    e.preventDefault()
                    dispatch(selectNodes(searchResult))
                    return
                }
                if (
                    activeFolder &&
                    activeFolder.children &&
                    activeFolder.children.length
                ) {
                    e.preventDefault()
                    dispatch(selectNodes(activeFolder.children))
                    return
                }
            }
        }
        window.addEventListener("keydown", selectAllListener)
        return () => window.removeEventListener("keydown", selectAllListener)
    }, [searchResult, activeFolder])

    // capture escape keyboard event to clear selected nodes
    React.useEffect(() => {
        const escapeListener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (selectedNodes.length) {
                    dispatch(clearSelectedNodes())
                }
            }
        }
        window.addEventListener("keydown", escapeListener)
        return () => {
            window.removeEventListener("keydown", escapeListener)
        }
    }, [selectedNodes])

    const {
        contextMenuProps,
        closeContextMenu,
        handleContextMenuEvent
    } = useContextMenu()

    const classNames = useStyle()

    return (
        <div
            className={className}
            onContextMenu={e => {
                handleContextMenuEvent(e)
            }}
        >
            {search ? (
                searchResult.length ? (
                    <Paper className={classNames.paper} elevation={3}>
                        {searchResult.map(child => (
                            <BookmarkTreeItem
                                key={child.id}
                                bookmarkNode={child}
                                isHovered={isNodeHovered(child, hoverState)}
                                hoverArea={
                                    hoverState ? hoverState.area : undefined
                                }
                            />
                        ))}
                    </Paper>
                ) : (
                    <div className={classNames.emptySearchResults}>
                        No search results found
                    </div>
                )
            ) : activeFolderChildren ? (
                <Paper className={classNames.paper} elevation={3}>
                    {activeFolderChildren.map(child => (
                        <BookmarkTreeItem
                            key={child.id}
                            bookmarkNode={child}
                            isHovered={isNodeHovered(child, hoverState)}
                            hoverArea={hoverState ? hoverState.area : undefined}
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
