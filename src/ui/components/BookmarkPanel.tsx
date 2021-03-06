import React, { useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Paper, Menu, MenuItem } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import copyToClipboard from "copy-to-clipboard"

import useContextMenu from "../hooks/useContextMenu"
import { openBookmarkCreateModal } from "../store/modal"
import { selectNodes, clearSelectedNodes, selectNode } from "../store/dnd"
import { setCopiedNodes } from "../store/cnp"
import { showSnackbar } from "../store/snackbar"
import { pasteNodes, isNodeBookmark, isNodeFolder, setHashParam, removeNodes } from "../utils"
import { openTab } from "../utils/bookmark"
import { RootState, BookmarkNodeType } from "../types"
import { __MAC__ } from "../consts"

import BookmarkTreeItem from "./BookmarkTreeItem"

const useStyle = makeStyles(theme => ({
    paper: {
        width: "100%",
        maxWidth: "960px",
        margin: "auto",
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(3),
        padding: theme.spacing(1, 0),
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
        cursor: "default",
    },
}))

export default function BookmarkPanel({ className }: { className?: string }) {
    const activeFolder = useSelector((state: RootState) => state.bookmark.activeFolder)
    const search = useSelector((state: RootState) => state.bookmark.search)
    const searchResult = useSelector((state: RootState) => state.bookmark.searchResult)
    const selectedNodes = useSelector((state: RootState) => state.dnd.selectedNodes)
    const copiedNodes = useSelector((state: RootState) => state.cnp.copied)
    const dispatch = useDispatch()

    const activeFolderChildren = useMemo(() => {
        return activeFolder !== null && Array.isArray(activeFolder.children) && activeFolder.children.length > 0
            ? activeFolder.children.filter(
                  child => child.type === BookmarkNodeType.Bookmark || child.type === BookmarkNodeType.Folder,
              )
            : null
    }, [activeFolder])

    // use arrow keys to move between bookmarks and folders
    // use enter key to open a bookmark or folder
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (!selectedNodes.length) return
            const items = searchResult.length ? searchResult : activeFolderChildren ?? []
            const currentIndex = items.findIndex(item => item.id === selectedNodes[0].id)
            if (e.key === "ArrowDown" && currentIndex < items.length - 1) {
                dispatch(selectNode(items[currentIndex + 1]))
            } else if (e.key === "ArrowUp" && currentIndex > 0) {
                dispatch(selectNode(items[currentIndex - 1]))
            } else if (e.key === "Enter") {
                const item = items[currentIndex!]
                if (isNodeBookmark(item)) {
                    // selectedNodes is guaranteed to be among items (searchResult || activeFolderChildren) , see render result down below
                    openTab(item.url!)
                } else if (isNodeFolder(item)) {
                    // clear out search state, and open that folder
                    setHashParam({ folder: item.id, search: undefined })
                }
            }
        }
        window.addEventListener("keydown", listener)
        return () => window.removeEventListener("keydown", listener)
    }, [searchResult, activeFolderChildren, selectedNodes])

    // capture select all hotkey to select all bookmark nodes that are currently displayed
    useEffect(() => {
        const selectAllListener = (e: KeyboardEvent) => {
            if (
                e.target === document.body && // only captures events fired globally
                e.key === "a" &&
                ((!__MAC__ && e.ctrlKey) || (__MAC__ && e.metaKey))
            ) {
                if (searchResult.length) {
                    e.preventDefault()
                    dispatch(selectNodes(searchResult))
                    return
                }
                if (activeFolder && activeFolder.children && activeFolder.children.length) {
                    e.preventDefault()
                    dispatch(selectNodes(activeFolder.children))
                    return
                }
            }
        }
        window.addEventListener("keydown", selectAllListener)
        return () => window.removeEventListener("keydown", selectAllListener)
    }, [searchResult, activeFolder])

    // capture escape key to clear selected nodes
    useEffect(() => {
        const escapeListener = (e: KeyboardEvent) => {
            if (e.target === document.body && e.key === "Escape") {
                if (selectedNodes.length) {
                    dispatch(clearSelectedNodes())
                }
            }
        }
        window.addEventListener("keydown", escapeListener)
        return () => window.removeEventListener("keydown", escapeListener)
    }, [selectedNodes])

    // copy and paste bookmarks
    useEffect(() => {
        const copyListener = (e: KeyboardEvent) => {
            if (e.target === document.body && e.key === "c" && ((__MAC__ && e.metaKey) || (!__MAC__ && e.ctrlKey))) {
                if (selectedNodes.length) {
                    e.preventDefault()
                    dispatch(setCopiedNodes([...selectedNodes]))
                    copyToClipboard(selectedNodes.map(node => node.url ?? node.title).join("\t\n"))
                    dispatch(showSnackbar({ message: `Copied ${selectedNodes.length} items` }))
                }
            }
        }
        window.addEventListener("keydown", copyListener)

        const pasteListener = async (e: KeyboardEvent) => {
            if (e.target === document.body && e.key === "v" && ((__MAC__ && e.metaKey) || (!__MAC__ && e.ctrlKey))) {
                if (copiedNodes.length) {
                    e.preventDefault()
                    // only paste when not searching and a folder opened
                    if (!search && activeFolder) {
                        // paste copied nodes after the last of the selected nodes or append in the children of the current folder
                        const target = selectedNodes[selectedNodes.length - 1]
                        pasteNodes({
                            src: copiedNodes,
                            dest: activeFolder,
                            destIndex: target ? target.index! : undefined,
                        })
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

    // capture delete key to delete selected nodes
    useEffect(() => {
        const deleteListener = async (e: KeyboardEvent) => {
            if (
                e.target === document.body &&
                ((__MAC__ && e.key === "Backspace" && e.metaKey) || (!__MAC__ && e.key === "Delete"))
            ) {
                removeNodes(selectedNodes)
            }
        }
        window.addEventListener("keydown", deleteListener)
        return () => window.removeEventListener("keydown", deleteListener)
    }, [selectedNodes])

    const { contextMenuProps, closeContextMenu, handleContextMenuEvent } = useContextMenu()

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
                            <BookmarkTreeItem key={child.id} bookmarkNode={child} />
                        ))}
                    </Paper>
                ) : (
                    <div className={classNames.emptySearchResults}>No search results found</div>
                )
            ) : activeFolderChildren ? (
                <Paper className={classNames.paper} elevation={3}>
                    {activeFolderChildren.map(child => (
                        <BookmarkTreeItem key={child.id} bookmarkNode={child} />
                    ))}
                </Paper>
            ) : null}
            <Menu {...contextMenuProps}>
                <MenuItem
                    onClick={() => {
                        dispatch(openBookmarkCreateModal(BookmarkNodeType.Bookmark))
                        closeContextMenu()
                    }}
                >
                    Add new bookmark
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        dispatch(openBookmarkCreateModal(BookmarkNodeType.Folder))
                        closeContextMenu()
                    }}
                >
                    Add new folder
                </MenuItem>
            </Menu>
        </div>
    )
}
