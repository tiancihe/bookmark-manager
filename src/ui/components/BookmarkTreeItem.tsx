import { useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Box, Menu, Typography } from "@mui/material"
import { useTheme, alpha, styled } from "@mui/material/styles"
import { FolderOutlined } from "@mui/icons-material"
import { useDrag, useDrop } from "react-dnd"

import useContextMenu from "../hooks/useContextMenu"
import useSettings from "../hooks/useSettings"
import { selectNodes, selectNode } from "../store/dnd"
import { getFavicon, setHashParam } from "../utils"
import {
    isNodeSelected,
    isNodeFolder,
    isNodeBookmark,
    moveBookmarksAboveTarget,
    moveBookmarksUnderParent,
    moveBookmarksBelowTarget,
    getParentPathDesc,
} from "../utils/bookmark"
import { handleHoverAndDrop } from "../utils/dnd"
import { BookmarkTreeNode } from "../types"
import { RootState, HoverArea } from "../types"
import { DNDTypes, __MAC__ } from "../consts"

import BookmarkActionMenu from "./BookmarkActionMenu"
import BookmarkActionMenuContent from "./BookmarkActionMenuContent"
import HoverStateManager from "../hover-state-manager"

const PREFIX = "BookmarkTreeItem"

const classes = {
    container: `${PREFIX}-container`,
    icon: `${PREFIX}-icon`,
    title: `${PREFIX}-title`,
    url: `${PREFIX}-url`,
    actions: `${PREFIX}-actions`,
}

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.container}`]: {
        display: "flex",
        alignItems: "center",
        paddingLeft: theme.spacing(3),
        userSelect: "none",
    },

    [`& .${classes.icon}`]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: theme.spacing(2),
        height: theme.spacing(2),
        "& img": {
            maxWidth: "100%",
            maxHeight: "100%",
        },
    },

    [`& .${classes.title}`]: {
        flex: 2,
        margin: theme.spacing(0, 2),
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
    },

    [`& .${classes.url}`]: {
        flex: 1,
        margin: theme.spacing(0, 2),
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        color: alpha(theme.palette.text.primary, 0.55),
    },

    [`& .${classes.actions}`]: {
        justifySelf: "flex-end",
    },
}))

export default function BookmarkTreeItem({
    bookmarkNode,
    showParentPath,
}: {
    bookmarkNode: BookmarkTreeNode
    showParentPath?: boolean
}) {
    const theme = useTheme()

    const activeFolder = useSelector((state: RootState) => state.bookmark.activeFolder)
    const searchResult = useSelector((state: RootState) => state.bookmark.searchResult)
    const selectedNodes = useSelector((state: RootState) => state.dnd.selectedNodes)
    const dispatch = useDispatch()

    const isFolder = isNodeFolder(bookmarkNode)
    const isBookmark = isNodeBookmark(bookmarkNode)
    const isSelected = isNodeSelected(bookmarkNode, selectedNodes)

    const nodeRef = useRef<HTMLElement | null>(null)
    const [, drag] = useDrag({
        type: DNDTypes.BookmarkItem,
        item: () => {
            if (selectedNodes.length === 0) {
                dispatch(selectNode(bookmarkNode))
            }
            return { type: DNDTypes.BookmarkItem }
        },
    })
    const [, drop] = useDrop({
        accept: DNDTypes.BookmarkItem,
        hover: (item, monitor) => {
            const node = nodeRef.current
            if (node) {
                HoverStateManager.subscribe({ bookmarkNode, isSelected, node, theme })
                handleHoverAndDrop({
                    node,
                    monitor,
                    top: () => HoverStateManager.applyHoverStyle(HoverArea.Top),
                    mid: () => HoverStateManager.applyHoverStyle(HoverArea.Mid),
                    bottom: () => HoverStateManager.applyHoverStyle(HoverArea.Bottom),
                })
            }
        },
        drop: (item, monitor) => {
            const node = nodeRef.current
            if (node && !isSelected) {
                handleHoverAndDrop({
                    node,
                    monitor,
                    top: () => moveBookmarksAboveTarget(selectedNodes, bookmarkNode),
                    mid: () => moveBookmarksUnderParent(selectedNodes, bookmarkNode),
                    bottom: () => moveBookmarksBelowTarget(selectedNodes, bookmarkNode),
                })
            }
            HoverStateManager.reset()
        },
    })
    drag(drop(nodeRef.current))

    const { contextMenuProps, handleContextMenuEvent, closeContextMenu } = useContextMenu()

    const { settings } = useSettings()

    return (
        <>
            <Box
                id={bookmarkNode.id}
                ref={nodeRef}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: theme.spacing(3),
                    paddingRight: theme.spacing(1),
                    backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : undefined,
                    userSelect: "none",
                }}
                onClick={e => {
                    e.stopPropagation()

                    if ((!__MAC__ && e.ctrlKey) || (__MAC__ && e.metaKey)) {
                        // if ctrl is pressed (command on mac)
                        if (!isSelected) {
                            // and the current node is not selected, select it
                            dispatch(selectNodes(selectedNodes.concat(bookmarkNode)))
                        } else {
                            // otherwise unselect it
                            dispatch(selectNodes(selectedNodes.filter(node => node.id !== bookmarkNode.id)))
                        }
                    } else if (e.shiftKey) {
                        // if shift is pressed, select all nodes between the first node and the current node, including them
                        // display strategy: searchResult || activeFolder.children

                        const target = searchResult.length > 0 ? searchResult : activeFolder!.children!
                        const firstNodeIndex = target.findIndex(node => node.id === selectedNodes[0].id)
                        const currentNodeIndex = target.findIndex(node => node.id === bookmarkNode.id)
                        dispatch(
                            selectNodes(
                                target.slice(
                                    Math.min(firstNodeIndex, currentNodeIndex),
                                    Math.max(firstNodeIndex, currentNodeIndex) + 1,
                                ),
                            ),
                        )
                    } else {
                        // select current node only
                        dispatch(selectNode(bookmarkNode))
                    }
                }}
                onDoubleClick={e => {
                    e.stopPropagation()

                    if (isFolder) {
                        setHashParam({
                            folder: bookmarkNode.id,
                            search: undefined,
                        })
                    }

                    if (isBookmark) {
                        browser.tabs.create({
                            url: bookmarkNode.url,
                        })
                    }
                }}
                onMouseDown={e => {
                    // in chrome (version: 81) bookmark manager, if user clicks a bookmark using middle mouse button
                    // a new tab will be opened in backgroud (not immediately active)
                    // that bookmark will get selected state exclusively (other selected tabs will be unselected)
                    if (e.button === 1) {
                        // middle mouse button clicked
                        e.preventDefault()

                        if (isBookmark) {
                            browser.tabs.create({
                                url: bookmarkNode.url,
                                active: false,
                            })
                        }

                        dispatch(selectNode(bookmarkNode))
                    }
                }}
                onContextMenu={e => {
                    e.stopPropagation()

                    if (!isSelected) {
                        dispatch(selectNode(bookmarkNode))
                    }

                    handleContextMenuEvent(e)
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: theme.spacing(2),
                        height: theme.spacing(2),
                        "& img": {
                            maxWidth: "100%",
                            maxHeight: "100%",
                        },
                    }}
                >
                    {isFolder && <FolderOutlined fontSize="small" />}
                    {!settings?.disableFavicon && isBookmark && <img src={getFavicon(bookmarkNode.url || "")} />}
                </Box>
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", overflow: "hidden" }}>
                    <Typography
                        sx={{
                            flex: showParentPath || settings?.alwaysShowURL || isSelected ? "0 auto" : 1,
                            marginLeft: theme.spacing(2),
                        }}
                        variant="body2"
                        noWrap
                        title={bookmarkNode.title}
                    >
                        {bookmarkNode.title}
                    </Typography>
                    {(() => {
                        if (showParentPath || settings?.alwaysShowURL || isSelected) {
                            const text =
                                showParentPath && !isSelected ? getParentPathDesc(bookmarkNode) : bookmarkNode.url
                            return (
                                <Typography
                                    sx={{
                                        flex: 1,
                                        minWidth: 200,
                                        margin: theme.spacing(0, 2),
                                        color: alpha(theme.palette.text.primary, 0.55),
                                    }}
                                    variant="body2"
                                    noWrap
                                    title={text}
                                >
                                    {text}
                                </Typography>
                            )
                        }
                        return null
                    })()}
                </Box>
                <BookmarkActionMenu />
            </Box>
            <Menu
                {...(contextMenuProps || {})}
                onDoubleClick={e => {
                    e.stopPropagation()
                }}
                onContextMenu={e => {
                    e.preventDefault()
                    e.stopPropagation()
                }}
            >
                <BookmarkActionMenuContent onCloseMenu={closeContextMenu} />
            </Menu>
        </>
    )
}
