import React from "react"
import { makeStyles, Theme, useTheme, fade } from "@material-ui/core"
import { ArrowRight, ArrowDropDown, FolderTwoTone } from "@material-ui/icons"
import { useDrop } from "react-dnd"

import { BookmarkTreeNode } from "../../types"

import { useStore } from "../Store"
import { DNDTypes } from "../consts"
import { useDndStore, HoverArea } from "../contexts/dnd"

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

export default function FolderTreeItem({
    level,
    bookmarkNode,
    children
}: React.PropsWithChildren<{
    level: number
    bookmarkNode: BookmarkTreeNode
}>) {
    const { activeFolderId, setActiveFolder } = useStore()
    const {
        selectedNodes,
        isNodeSelected,

        hoverState,
        isNodeHovered,
        setHoverState,
        clearHoverState
    } = useDndStore()
    const isSelected = isNodeSelected(bookmarkNode)
    const isHovered = isNodeHovered(bookmarkNode)

    const [open, setOpen] = React.useState(false)

    const hasSubfolders = React.useMemo(
        () =>
            Array.isArray(bookmarkNode.children) &&
            Boolean(
                bookmarkNode.children.filter(node => node.type === "folder")
                    .length
            ),
        [bookmarkNode]
    )

    const [, drop] = useDrop({
        accept: DNDTypes.BookmarkItem,
        hover: (item, monitor) => {
            if (!hoverState || !isHovered) {
                setHoverState({
                    node: bookmarkNode,
                    area: HoverArea.Mid
                })
            }
        },
        drop: (item, monitor) => {
            const move = async () => {
                for (let i = 0; i < selectedNodes.length; i++) {
                    browser.bookmarks.move(selectedNodes[i].id, {
                        parentId: bookmarkNode.id
                    })
                }
            }
            move()
            clearHoverState()
        }
    })

    const theme = useTheme()
    const classNames = useFolderTreeItemStyle({
        level,
        active: activeFolderId === bookmarkNode.id
    })

    return (
        <React.Fragment>
            <div
                ref={drop}
                className={classNames.container}
                style={{
                    backgroundColor: isHovered
                        ? fade(theme.palette.primary.main, 0.25)
                        : undefined
                }}
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
                <div className={classNames.text}>{bookmarkNode.title}</div>
            </div>
            {open && children}
        </React.Fragment>
    )
}
