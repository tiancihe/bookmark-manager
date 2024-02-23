import { useEffect, useMemo } from "react"
import { styled } from "@mui/material/styles"
import { useSelector, useDispatch } from "react-redux"
import { Paper, Menu, MenuItem, Typography, Stack, Box } from "@mui/material"

import useContextMenu from "../hooks/useContextMenu"
import { useCopyPasteCut } from "../hooks/useCopyPasteCut"
import { openBookmarkCreateModal } from "../store/modal"
import { setSnackbarMessage } from "../store/message"
import { selectNodes, clearSelectedNodes, selectNode } from "../store/dnd"
import { setHashParam } from "../utils"
import { isNodeBookmark, isNodeFolder, removeBookmarks, openTab } from "../utils/bookmark"
import { RootState, BookmarkNodeType } from "../types"
import { __MAC__ } from "../consts"
import BookmarkTreeItem from "./BookmarkTreeItem"

const StyledPaper = styled(Paper)(({ theme }) => {
    return {
        width: "100%",
        maxWidth: 960,
        margin: theme.spacing(0, "auto"),
        padding: theme.spacing(1, 0),
    }
})

export default function BookmarkPanel() {
    const activeFolder = useSelector((state: RootState) => state.bookmark.activeFolder)
    const duplicatedBookmarks = useSelector((state: RootState) => state.bookmark.duplicatedBookmarks)
    const search = useSelector((state: RootState) => state.bookmark.search)
    const searchResult = useSelector((state: RootState) => state.bookmark.searchResult)
    const selectedNodes = useSelector((state: RootState) => state.dnd.selectedNodes)
    const dispatch = useDispatch()

    const activeFolderChildren = useMemo(() => {
        return activeFolder !== null && Array.isArray(activeFolder.children) && activeFolder.children.length > 0
            ? activeFolder.children
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

    // capture delete key to delete selected nodes
    useEffect(() => {
        const deleteListener = async (e: KeyboardEvent) => {
            if (
                e.target === document.body &&
                ((__MAC__ && e.key === "Backspace") || (!__MAC__ && e.key === "Delete"))
            ) {
                removeBookmarks(selectedNodes)
                dispatch(setSnackbarMessage(`${selectedNodes.length} items deleted`))
            }
        }
        window.addEventListener("keydown", deleteListener)
        return () => window.removeEventListener("keydown", deleteListener)
    }, [selectedNodes])

    const { contextMenuProps, closeContextMenu, handleContextMenuEvent } = useContextMenu()

    useCopyPasteCut()

    return (
        <Box
            sx={{
                flex: 1,
                height: "100%",
                padding: theme => theme.spacing(3, 4),
                overflow: "auto",
            }}
            onContextMenu={e => {
                handleContextMenuEvent(e)
            }}
        >
            {duplicatedBookmarks.length ? (
                <StyledPaper elevation={3}>
                    {duplicatedBookmarks.map(child => (
                        <BookmarkTreeItem key={child.id} bookmarkNode={child} showParentPath={true} />
                    ))}
                </StyledPaper>
            ) : search ? (
                searchResult.length ? (
                    <StyledPaper elevation={3}>
                        {searchResult.map(child => (
                            <BookmarkTreeItem key={child.id} bookmarkNode={child} />
                        ))}
                    </StyledPaper>
                ) : (
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        <Typography variant="body2" color={theme => theme.palette.text.secondary}>
                            No search results found
                        </Typography>
                    </Stack>
                )
            ) : activeFolderChildren ? (
                <StyledPaper elevation={3}>
                    {activeFolderChildren.map(child => (
                        <BookmarkTreeItem key={child.id} bookmarkNode={child} />
                    ))}
                </StyledPaper>
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
        </Box>
    )
}
