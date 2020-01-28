import React from "react"
import { makeStyles, useTheme, fade } from "@material-ui/core"
import { FolderTwoTone } from "@material-ui/icons"
import { useDrag, useDrop } from "react-dnd"

import { BookmarkTreeNode } from "../../types"

import BookmarkActionMenu from "./BookmarkActionMenu"
import { getFavicon } from "../utils"
import { useStore } from "../Store"
import { DNDTypes } from "../consts"
import { useDndStore, HoverArea } from "../contexts/dnd"

const useBookmarkListItemStyle = makeStyles(theme => ({
    container: {
        display: "flex",
        alignItems: "center",
        paddingLeft: theme.spacing(3),
        userSelect: "none"
    },
    icon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: theme.spacing(3),
        height: theme.spacing(3)
    },
    title: {
        flex: 2,
        margin: theme.spacing(0, 2),
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
    },
    url: {
        flex: 1,
        margin: theme.spacing(0, 2),
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
    },
    actions: {
        justifySelf: "flex-end"
    }
}))

export default function BookmarkTreeItem({
    bookmarkNode
}: {
    bookmarkNode: BookmarkTreeNode
}) {
    const isFolder = bookmarkNode.type === "folder"
    const isBookmark = bookmarkNode.type === "bookmark"

    const { setActiveFolder } = useStore()
    const {
        selectedNodes,
        isNodeSelected,
        setSelectedNodes,

        hoverState,
        isNodeHovered,
        setHoverState,
        clearHoverState
    } = useDndStore()
    const isSelected = isNodeSelected(bookmarkNode)
    const isHovered = isNodeHovered(bookmarkNode)

    const nodeRef = React.useRef(React.createRef<HTMLDivElement>())

    const [, drag] = useDrag({
        item: { type: DNDTypes.BookmarkItem },
        begin: () => {
            if (!isSelected) {
                setSelectedNodes([bookmarkNode])
            }
        }
    })

    const [, drop] = useDrop({
        accept: DNDTypes.BookmarkItem,
        hover: (item, monitor) => {
            const node = nodeRef.current.current

            if (node) {
                const rect = node.getBoundingClientRect()
                const pos = monitor.getClientOffset()

                if (
                    pos &&
                    pos.x > rect.left &&
                    pos.x < rect.right &&
                    pos.y > rect.top &&
                    pos.y < rect.bottom
                ) {
                    const topMid = rect.top + rect.height / 3
                    const midBottom = rect.bottom - rect.height / 3

                    setHoverState({
                        node: bookmarkNode,
                        area:
                            pos.y < topMid
                                ? HoverArea.Top
                                : pos.y < midBottom
                                ? HoverArea.Mid
                                : HoverArea.Bottom
                    })
                }
            }
        },
        drop: (item, monitor) => {
            const node = nodeRef.current.current

            if (node && !isSelected) {
                const rect = node.getBoundingClientRect()
                const pos = monitor.getClientOffset()

                if (
                    pos &&
                    pos.x > rect.left &&
                    pos.x < rect.right &&
                    pos.y > rect.top &&
                    pos.y < rect.bottom
                ) {
                    const topMid = rect.top + rect.height / 3
                    const midBottom = rect.bottom - rect.height / 3

                    if (pos.y < topMid) {
                        const move = async () => {
                            for (let i = 0; i < selectedNodes.length; i++) {
                                browser.bookmarks.move(selectedNodes[i].id, {
                                    parentId: bookmarkNode.parentId,
                                    index: bookmarkNode.index! + i
                                })
                            }
                        }
                        move()
                    } else if (pos.y < midBottom) {
                        if (isFolder) {
                            const move = async () => {
                                for (let i = 0; i < selectedNodes.length; i++) {
                                    browser.bookmarks.move(
                                        selectedNodes[i].id,
                                        {
                                            parentId: bookmarkNode.id
                                        }
                                    )
                                }
                            }
                            move()
                        }
                    } else {
                        const move = async () => {
                            for (let i = 0; i < selectedNodes.length; i++) {
                                browser.bookmarks.move(selectedNodes[i].id, {
                                    parentId: bookmarkNode.parentId,
                                    index: bookmarkNode.index! + 1 + i
                                })
                            }
                        }
                        move()
                    }
                }
            }

            clearHoverState()
        }
    })

    const theme = useTheme()
    const classNames = useBookmarkListItemStyle()

    if (!isFolder && !isBookmark) return null

    drag(drop(nodeRef.current))

    return (
        <div
            ref={nodeRef.current}
            className={classNames.container}
            style={{
                borderTop:
                    isHovered && hoverState!.area === HoverArea.Top
                        ? `1px solid ${theme.palette.primary.main}`
                        : undefined,
                borderBottom:
                    isHovered && hoverState!.area === HoverArea.Bottom
                        ? `1px solid ${theme.palette.primary.main}`
                        : undefined,
                backgroundColor:
                    isSelected ||
                    (isHovered && hoverState!.area === HoverArea.Mid)
                        ? fade(theme.palette.primary.main, 0.25)
                        : undefined
            }}
            onClick={e => {
                e.stopPropagation()
                setSelectedNodes([bookmarkNode])
            }}
            onDoubleClick={e => {
                e.stopPropagation()

                if (isFolder) {
                    setActiveFolder(bookmarkNode.id)
                }

                if (isBookmark) {
                    browser.tabs.create({
                        url: bookmarkNode.url,
                        active: true
                    })
                }
            }}
            onContextMenu={e => {
                e.stopPropagation()
            }}
        >
            <div className={classNames.icon}>
                {isFolder && <FolderTwoTone />}
                {isBookmark && <img src={getFavicon(bookmarkNode.url || "")} />}
            </div>
            <div className={classNames.title} title={bookmarkNode.title}>
                {bookmarkNode.title}
            </div>
            {isSelected && (
                <div className={classNames.url} title={bookmarkNode.url}>
                    {bookmarkNode.url}
                </div>
            )}
            <BookmarkActionMenu
                className={classNames.actions}
                bookmarkNode={bookmarkNode}
            />
        </div>
    )
}
