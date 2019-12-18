import React, { useMemo, useState } from "react"
import { makeStyles, Theme } from "@material-ui/core"
import { ArrowRight, ArrowDropDown, FolderTwoTone } from "@material-ui/icons"

import { BookmarkTreeNode } from "../../types"
import { useStore } from "../Store"

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
    const { activeFolderId, setActiveFolder } = useStore()

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

    return (
        <React.Fragment>
            <div
                className={classNames.container}
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

export default FolderTreeItem
