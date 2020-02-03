import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { makeStyles, Theme, useTheme, fade } from "@material-ui/core/styles"
import {
    ArrowRight,
    ArrowDropDown,
    FolderTwoTone,
    FolderOpenTwoTone
} from "@material-ui/icons"
import { useDrop } from "react-dnd"

import { BookmarkTreeNode } from "../../types"
import { RootState, HoverArea } from "../types"
import { DNDTypes } from "../consts"
import { setHoverState, clearHoverState } from "../store/dnd"
import { isNodeHovered, setHashParam } from "../utils"

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
    defaultOpen,
    children
}: React.PropsWithChildren<{
    level: number
    bookmarkNode: BookmarkTreeNode
    defaultOpen?: boolean
}>) {
    const activeFolder = useSelector(
        (state: RootState) => state.bookmark.activeFolder
    )
    const search = useSelector((state: RootState) => state.bookmark.search)
    // if search state is true, all folder items should stay inactive
    // user should be able to click any folder to active it and clear search state in the mean time
    const isActive =
        !search && activeFolder !== null && activeFolder.id === bookmarkNode.id

    const selectedNodes = useSelector(
        (state: RootState) => state.dnd.selectedNodes
    )

    const hoverState = useSelector((state: RootState) => state.dnd.hoverState)
    const isHovered = isNodeHovered(bookmarkNode, hoverState)

    const dispatch = useDispatch()

    const [open, setOpen] = React.useState(defaultOpen)

    React.useEffect(() => {
        if (defaultOpen && !open) {
            setOpen(true)
        }
    }, [defaultOpen])

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
        active: isActive
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
                        // there are two cases when isActive is false:
                        if (search) {
                            // 1: search state is not empty
                            setHashParam({
                                folder: bookmarkNode.id,
                                search: undefined
                            })
                        } else {
                            // 2: search state is empty and there is no active folder
                            setHashParam({ folder: bookmarkNode.id })
                        }
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
                    {open ? <FolderOpenTwoTone /> : <FolderTwoTone />}
                </div>
                <div className={classNames.text}>{bookmarkNode.title}</div>
            </div>
            {open && children}
        </React.Fragment>
    )
}
