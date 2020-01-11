import React, { useMemo, useState, useRef, createRef } from "react"
import { makeStyles, Theme, useTheme } from "@material-ui/core"
import { ArrowRight, ArrowDropDown, FolderTwoTone } from "@material-ui/icons"
import { useDrop, DragObjectWithType } from "react-dnd"

import { BookmarkTreeNode } from "../../types"
import { useStore } from "../Store"
import { DNDTypes } from "../consts"

const useFolderTreeItemStyle = makeStyles<
    Theme,
    { level: number; active: boolean }
>(theme => ({
    container: {
        display: "flex",
        alignItems: "center",
        height: "40px",
        paddingLeft: props => props.level * 24 + "px",
        cursor: "pointer"
    },
    icon: {
        display: "flex",
        alignItems: "center",
        width: "24px",
        height: "40px"
    },
    text: {
        paddingLeft: "8px",
        color: props =>
            props.active
                ? theme.palette.primary.main
                : theme.palette.text.primary
    }
}))

const FolderTreeItem: React.FC<React.PropsWithChildren<{
    level: number
    bookmarkNode: BookmarkTreeNode
}>> = ({ level, bookmarkNode, children }) => {
    const {
        activeFolderId,
        setActiveFolder,
        draggingNode,
        hoverState,
        setHoverState
    } = useStore()
    const theme = useTheme()

    const classNames = useFolderTreeItemStyle({
        level,
        active: activeFolderId === bookmarkNode.id
    })

    const [open, setOpen] = useState(false)

    const hasSubfolders = useMemo(
        () =>
            Array.isArray(bookmarkNode.children) &&
            Boolean(
                bookmarkNode.children.filter(node => node.type === "folder")
                    .length
            ),
        [bookmarkNode]
    )

    const nodeRef = useRef(createRef<HTMLDivElement>())

    const [, drop] = useDrop<DragObjectWithType & { id: string }, void, void>({
        accept: DNDTypes.BookmarkItem,
        hover: (item, monitor) => {
            if (!hoverState.node || hoverState.node.id !== bookmarkNode.id) {
                setHoverState({
                    node: bookmarkNode,
                    area: "mid"
                })
            }
        },
        drop: (item, monitor) => {
            if (draggingNode) {
                browser.bookmarks.move(draggingNode.id, {
                    parentId: bookmarkNode.id
                })
            }

            setHoverState({
                node: null,
                area: null
            })
        }
    })

    drop(nodeRef.current)

    const isHovered = hoverState.node && hoverState.node.id === bookmarkNode.id

    return (
        <React.Fragment>
            <div
                ref={nodeRef.current}
                className={classNames.container}
                style={
                    isHovered
                        ? {
                              backgroundColor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText
                          }
                        : undefined
                }
                onClick={() =>
                    activeFolderId !== bookmarkNode.id &&
                    setActiveFolder(bookmarkNode.id)
                }
            >
                <div className={classNames.icon}>
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
                </div>
                <div className={classNames.icon}>
                    <FolderTwoTone />
                </div>
                <div
                    className={classNames.text}
                    style={
                        isHovered
                            ? { color: theme.palette.primary.contrastText }
                            : undefined
                    }
                >
                    {bookmarkNode.title}
                </div>
            </div>
            {open && children}
        </React.Fragment>
    )
}

export default FolderTreeItem
