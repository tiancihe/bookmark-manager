import React, { useState } from "react"
import { Menu, IconButton } from "@material-ui/core"
import { MoreVert } from "@material-ui/icons"

import { BookmarkTreeNode } from "../../types"

import BookmarkActionMenuContent from "./BookmarkActionMenuContent"

export default function BookmarkActionMenu({
    bookmarkNode,
    className
}: {
    bookmarkNode: BookmarkTreeNode
    className?: string
}) {
    const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null)
    const closeMenu = () => setMenuAnchor(null)

    return (
        <React.Fragment>
            <IconButton
                className={className}
                onClick={e => setMenuAnchor(e.currentTarget)}
                onDoubleClick={e => e.stopPropagation()}
            >
                <MoreVert />
            </IconButton>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
                onDoubleClick={e => {
                    e.stopPropagation()
                }}
            >
                <BookmarkActionMenuContent
                    bookmarkNode={bookmarkNode}
                    onCloseMenu={closeMenu}
                />
            </Menu>
        </React.Fragment>
    )
}
