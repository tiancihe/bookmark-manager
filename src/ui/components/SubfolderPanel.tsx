import React, { useState } from "react"
import { makeStyles, Paper, Menu, MenuItem } from "@material-ui/core"

import { useStore } from "../Store"
import BookmarkTreeItem from "./BookmarkTreeItem"
import CreateBookmarkModal from "./CreateBookmarkModal"

const useSubfolderStyle = makeStyles({
    paper: {
        width: "100%",
        maxWidth: "960px",
        padding: "8px 0",
        margin: "auto"
    }
})

const SubfolderPanel: React.FC<{ className?: string }> = ({ className }) => {
    const classNames = useSubfolderStyle()

    const { activeFolder, searchResult } = useStore()

    const [mousePosition, setMousePosition] = useState<{
        x: number
        y: number
    } | null>(null)

    const [createType, setCreateType] = useState<"bookmark" | "folder" | null>(
        null
    )

    const closeContextMenu = () => {
        setMousePosition(null)
    }

    let content: React.ReactNode = null
    if (Array.isArray(searchResult) && searchResult.length) {
        content = (
            <Paper className={classNames.paper} elevation={3}>
                {searchResult.map(child => (
                    <BookmarkTreeItem key={child.id} bookmarkNode={child} />
                ))}
            </Paper>
        )
    } else if (
        activeFolder &&
        activeFolder.children &&
        activeFolder.children.length
    ) {
        content = (
            <Paper className={classNames.paper} elevation={3}>
                {activeFolder.children.map(child => (
                    <BookmarkTreeItem key={child.id} bookmarkNode={child} />
                ))}
            </Paper>
        )
    }

    return (
        <div
            className={className}
            onContextMenu={e => {
                e.preventDefault()
                setMousePosition({
                    x: e.clientX - 2,
                    y: e.clientY - 4
                })
            }}
        >
            {content}
            <Menu
                anchorPosition={
                    mousePosition
                        ? {
                              left: mousePosition.x,
                              top: mousePosition.y
                          }
                        : undefined
                }
                anchorReference="anchorPosition"
                open={Boolean(mousePosition)}
                onClose={closeContextMenu}
            >
                <MenuItem
                    onClick={() => {
                        setCreateType("bookmark")
                        closeContextMenu()
                    }}
                >
                    Add new bookmark
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setCreateType("folder")
                        closeContextMenu()
                    }}
                >
                    Add new folder
                </MenuItem>
            </Menu>
            {createType && (
                <CreateBookmarkModal
                    createType={createType}
                    onClose={() => setCreateType(null)}
                />
            )}
        </div>
    )
}

export default SubfolderPanel
