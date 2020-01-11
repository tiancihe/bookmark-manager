import React, { useRef, createRef } from "react"
import { makeStyles, useTheme } from "@material-ui/core"
import { FolderTwoTone } from "@material-ui/icons"
import { useDrag, useDrop } from "react-dnd"

import BookmarkActionMenu from "./BookmarkActionMenu"
import { getFavicon } from "../utils"
import { useStore } from "../Store"
import { DNDTypes } from "../consts"
import { HoverArea } from "../types"
import { BookmarkTreeNode } from "../../types"

const useBookmarkListItemStyle = makeStyles({
    container: {
        display: "flex",
        alignItems: "center",
        paddingLeft: "24px",
        userSelect: "none"
    },
    icon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px"
    },
    title: {
        flex: 1,
        margin: "0 16px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
    },
    actions: {
        justifySelf: "flex-end"
    }
})

const BookmarkTreeItem: React.FC<{
    bookmarkNode: BookmarkTreeNode
}> = ({ bookmarkNode }) => {
    // console.log("render BookmarkTreeItem")
    const isFolder = bookmarkNode.type === "folder"
    const isBookmark = bookmarkNode.type === "bookmark"

    const {
        setActiveFolder,
        draggingNode,
        setDraggingNode,
        hoverState,
        setHoverState
    } = useStore()
    const theme = useTheme()

    const nodeRef = useRef(createRef<HTMLDivElement>())

    const [, drag] = useDrag({
        item: { type: DNDTypes.BookmarkItem },
        begin: () => {
            setDraggingNode(bookmarkNode)
        },
        end: () => {
            setDraggingNode(null)
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

                    let area: HoverArea = null
                    if (pos.y < topMid) {
                        area = "top"
                    } else if (pos.y < midBottom) {
                        if (isFolder) {
                            area = "mid"
                        }
                    } else {
                        area = "bottom"
                    }
                    setHoverState({
                        node: bookmarkNode,
                        area
                    })
                }
            }
        },
        drop: (item, monitor) => {
            const node = nodeRef.current.current

            if (draggingNode && node && draggingNode.id !== bookmarkNode.id) {
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
                        browser.bookmarks.move(draggingNode.id, {
                            parentId: bookmarkNode.parentId,
                            index: bookmarkNode.index
                        })
                    } else if (pos.y < midBottom) {
                        if (isFolder) {
                            browser.bookmarks.move(draggingNode.id, {
                                parentId: bookmarkNode.id
                            })
                        }
                    } else {
                        if (draggingNode.index !== bookmarkNode.index! + 1) {
                            browser.bookmarks.move(draggingNode.id, {
                                parentId: bookmarkNode.parentId,
                                index: bookmarkNode.index! + 1
                            })
                        }
                    }
                }
            }

            setHoverState({ node: null, area: null }) // reset hover state after drop
        }
    })

    const classNames = useBookmarkListItemStyle()

    if (isFolder || isBookmark) {
        drag(drop(nodeRef.current))
        return (
            <div
                ref={nodeRef.current}
                className={classNames.container}
                style={
                    hoverState.node && hoverState.node.id === bookmarkNode.id
                        ? {
                              borderTop:
                                  hoverState.area === "top"
                                      ? `1px solid ${theme.palette.primary.main}`
                                      : undefined,
                              borderBottom:
                                  hoverState.area === "bottom"
                                      ? `1px solid ${theme.palette.primary.main}`
                                      : undefined,
                              backgroundColor:
                                  hoverState.area === "mid"
                                      ? theme.palette.primary.main
                                      : undefined
                          }
                        : undefined
                }
                onDoubleClick={() => {
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
            >
                <div className={classNames.icon}>
                    {isFolder && <FolderTwoTone />}
                    {isBookmark && (
                        <img src={getFavicon(bookmarkNode.url || "")} />
                    )}
                </div>
                <div className={classNames.title}>{bookmarkNode.title}</div>
                <BookmarkActionMenu
                    className={classNames.actions}
                    bookmarkNode={bookmarkNode}
                />
            </div>
        )
    }

    return null
}

export default BookmarkTreeItem
