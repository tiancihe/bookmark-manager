import { PropsWithChildren, useState, useEffect, useMemo, useRef } from "react"
import { Box, Menu, Typography } from "@mui/material"
import { useTheme, alpha } from "@mui/material/styles"
import {
    ArrowRight,
    ArrowDropDown,
    FolderOutlined,
    FolderOpenOutlined,
} from "@mui/icons-material"
import { useDrop, useDrag } from "react-dnd"

import useContextMenu from "../hooks/useContextMenu"
import { setHashParam } from "../utils/hashParams"
import {
    isNodeFolder,
    isNodeSelected,
    moveBookmarksUnderParent,
    moveBookmarksAboveTarget,
    moveBookmarksBelowTarget,
} from "../utils/bookmark"
import { handleHoverAndDrop } from "../utils/dnd"
import { BookmarkTreeNode, HoverArea } from "../types"
import { DNDTypes } from "../consts"
import FolderTreeItemContextMenuContent from "./FolderTreeItemContextMenuContent"
import HoverStateManager from "../hover-state-manager"
import { setSelectedBookmarkNodes, useStore } from "../store"

export default function FolderTreeItem({
    level,
    bookmarkNode,
    defaultOpen,
    children,
}: PropsWithChildren<{
    level: number
    bookmarkNode: BookmarkTreeNode
    defaultOpen?: boolean
}>) {
    const theme = useTheme()

    const activeFolder = useStore(state => state.activeFolder)
    const search = useStore(state => state.search)
    // if search state is true, all folder items should stay inactive
    // user should be able to click any folder to active it and clear search state in the mean time
    const isActive = !search && activeFolder?.id === bookmarkNode.id

    const selectedNodes = useStore(state => state.selectedBookmarkNodes)
    const isSelected = isNodeSelected(bookmarkNode, selectedNodes)

    const [open, setOpen] = useState(defaultOpen)

    useEffect(() => {
        if (defaultOpen && !open) {
            setOpen(true)
        }
    }, [defaultOpen])

    const hasSubfolders = useMemo(
        () =>
            Array.isArray(bookmarkNode.children) &&
            bookmarkNode.children.filter(isNodeFolder).length > 0,
        [bookmarkNode],
    )

    const nodeRef = useRef<HTMLElement | null>(null)
    const [, drag] = useDrag({
        type: DNDTypes.FolderItem,
        item: () => {
            if (selectedNodes.length === 0) {
                setSelectedBookmarkNodes([bookmarkNode])
            }
            return { type: DNDTypes.FolderItem }
        },
    })
    const [, drop] = useDrop({
        accept: [DNDTypes.BookmarkItem, DNDTypes.FolderItem],
        hover: (item, monitor) => {
            const node = nodeRef.current
            if (node) {
                HoverStateManager.subscribe({
                    bookmarkNode,
                    isSelected,
                    node,
                    theme,
                })
                handleHoverAndDrop({
                    node,
                    monitor,
                    top: () => HoverStateManager.applyHoverStyle(HoverArea.Top),
                    mid: () => HoverStateManager.applyHoverStyle(HoverArea.Mid),
                    bottom: () =>
                        HoverStateManager.applyHoverStyle(HoverArea.Bottom),
                })
            }
        },
        drop: (item, monitor) => {
            const node = nodeRef.current
            if (node) {
                handleHoverAndDrop({
                    node,
                    monitor,
                    top: () =>
                        moveBookmarksAboveTarget(selectedNodes, bookmarkNode),
                    mid: () =>
                        moveBookmarksUnderParent(selectedNodes, bookmarkNode),
                    bottom: () =>
                        moveBookmarksBelowTarget(selectedNodes, bookmarkNode),
                })
            }
            HoverStateManager.reset()
        },
    })

    drag(drop(nodeRef.current))

    const { contextMenuProps, handleContextMenuEvent, closeContextMenu } =
        useContextMenu()

    return (
        <>
            <Box
                id={bookmarkNode.id}
                ref={nodeRef}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    height: theme.spacing(5),
                    paddingLeft: theme.spacing(3 * level),
                    borderRadius: theme.spacing(0, 3, 3, 0),
                    backgroundColor: isActive
                        ? alpha(theme.palette.primary.main, 0.1)
                        : undefined,
                    cursor: "pointer",
                    "&:hover": {
                        backgroundColor: isActive
                            ? undefined
                            : theme.palette.action.hover,
                    },
                }}
                onClick={e => {
                    e.stopPropagation()
                    setHashParam({
                        folder: bookmarkNode.id,
                        search: undefined,
                        dedupe: undefined,
                    })
                }}
                onContextMenu={e => {
                    e.preventDefault()
                    setHashParam({ folder: bookmarkNode.id })
                    handleContextMenuEvent(e)
                }}
            >
                <Box
                    sx={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: theme.spacing(5),
                        height: theme.spacing(5),
                        color: isActive
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                    }}
                >
                    {hasSubfolders &&
                        (open ? (
                            <ArrowDropDown
                                onClick={e => {
                                    e.stopPropagation()
                                    setOpen(false)
                                }}
                            />
                        ) : (
                            <ArrowRight
                                onClick={e => {
                                    e.stopPropagation()
                                    setOpen(true)
                                }}
                            />
                        ))}
                </Box>
                <Box
                    sx={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        width: theme.spacing(3),
                        height: theme.spacing(5),
                        color: isActive
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                    }}
                >
                    {open ? (
                        <FolderOpenOutlined fontSize="small" />
                    ) : (
                        <FolderOutlined fontSize="small" />
                    )}
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        paddingLeft: theme.spacing(1),
                        color: isActive
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                        userSelect: "none",
                    }}
                    noWrap
                    title={bookmarkNode.title}
                >
                    {bookmarkNode.title}
                </Typography>
            </Box>
            <Menu {...contextMenuProps}>
                <FolderTreeItemContextMenuContent
                    bookmarkNode={bookmarkNode}
                    onClose={closeContextMenu}
                />
            </Menu>
            {open && children}
        </>
    )
}
