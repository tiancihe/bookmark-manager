import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { makeStyles, Theme, useTheme, fade } from "@material-ui/core"
import { ArrowRight, ArrowDropDown, FolderTwoTone } from "@material-ui/icons"
import { useDrop } from "react-dnd"

import { BookmarkTreeNode } from "../../types"
import { RootState, HoverArea } from "../types"
import { DNDTypes } from "../consts"
import { setHoverState, clearHoverState } from "../store/dnd"
import { setActiveFolder } from "../store/bookmark"
import useSelectedNodes from "../hooks/useSelectedNodes"
import useHoverState from "../hooks/useHoverState"

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
    const activeFolder = useSelector(
        (state: RootState) => state.bookmark.activeFolder
    )
    const isActive =
        activeFolder !== null && activeFolder.id === bookmarkNode.id

    const { selectedNodes } = useSelectedNodes()

    const { hoverState, isNodeHovered } = useHoverState()
    const isHovered = isNodeHovered(bookmarkNode)

    const dispatch = useDispatch()

    const [open, setOpen] = React.useState(false)

    const hasSubfolders = React.useMemo(
        () =>
            Array.isArray(bookmarkNode.children) &&
            bookmarkNode.children.filter(node => node.type === "folder")
                .length > 0,
        [bookmarkNode]
    )

    const [, drop] = useDrop({
        accept: DNDTypes.BookmarkItem,
        hover: (item, monitor) => {
            if (!hoverState || !isHovered) {
                dispatch(
                    setHoverState({
                        node: bookmarkNode,
                        area: HoverArea.Mid
                    })
                )
            }
        },
        drop: (item, monitor) => {
            const move = async () => {
                for (let i = 0; i < selectedNodes.length; i++) {
                    await browser.bookmarks.move(selectedNodes[i].id, {
                        parentId: bookmarkNode.id
                    })
                }
            }
            move()
            dispatch(clearHoverState())
        }
    })

    const theme = useTheme()
    const classNames = useFolderTreeItemStyle({
        level,
        active: activeFolder !== null && activeFolder.id === bookmarkNode.id
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
                onClick={e => {
                    e.stopPropagation()
                    if (!isActive) {
                        dispatch(setActiveFolder(bookmarkNode))
                    }
                }}
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
