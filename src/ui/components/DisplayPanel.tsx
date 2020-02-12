import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Paper, Menu, MenuItem } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import copy from "copy-to-clipboard"

import { openBookmarkCreateModal } from "../store/modal"
import { selectNodes, clearSelectedNodes } from "../store/dnd"
import { RootState, BookmarkNodeType } from "../types"
import { isNodeHovered } from "../utils"
import { __MAC__ } from "../consts"
import useContextMenu from "../hooks/useContextMenu"

import BookmarkTreeItem from "./BookmarkTreeItem"
import { setCopiedNodes } from "../store/cnp"

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
    const copiedNodes = useSelector((state: RootState) => state.cnp.copied)
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
        return () => window.removeEventListener("keydown", escapeListener)
    }, [selectedNodes])

    // copy and paste selected nodes
    React.useEffect(() => {
        const copyListener = (e: KeyboardEvent) => {
            if (
                e.key === "c" &&
                ((__MAC__ && e.metaKey) || (!__MAC__ && e.ctrlKey))
            ) {
                if (selectedNodes.length) {
                    e.preventDefault()
                    dispatch(setCopiedNodes([...selectedNodes]))
                    copy(selectedNodes.map(node => node.url).join("\t\n"))
                }
            }
        }
        window.addEventListener("keydown", copyListener)

        const pasteListener = async (e: KeyboardEvent) => {
            if (
                e.key === "v" &&
                ((__MAC__ && e.metaKey) || (!__MAC__ && e.ctrlKey))
            ) {
                if (copiedNodes.length) {
                    e.preventDefault()
                    // only paste when not searching and a folder opened
                    if (!search && activeFolder) {
                        // paste copied nodes after the last of the selected nodes or append in the children of the current folder
                        for (let i = 0; i < copiedNodes.length; i++) {
                            const node = copiedNodes[i]
                            if (selectedNodes.length) {
                                const target =
                                    selectedNodes[selectedNodes.length - 1]
                                await browser.bookmarks.create({
                                    parentId: target.parentId,
                                    index: target.index! + 1 + i,
                                    title: node.title,
                                    url: node.url,
                                    type: "bookmark"
                                })
                            } else {
                                await browser.bookmarks.create({
                                    parentId: activeFolder.id,
                                    title: node.title,
                                    url: node.url,
                                    type: "bookmark"
                                })
                            }
                        }
                    }
                }
            }
        }
        window.addEventListener("keydown", pasteListener)

        return () => {
            window.removeEventListener("keydown", copyListener)
            window.removeEventListener("keydown", pasteListener)
        }
    }, [selectedNodes, copiedNodes])

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
