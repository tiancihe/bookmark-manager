import { useState } from "react"
import { Menu, IconButton } from "@mui/material"
import { MoreVert } from "@mui/icons-material"

import BookmarkActionMenuContent from "./BookmarkActionMenuContent"

export default function BookmarkActionMenu() {
    const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null)
    const closeMenu = () => setMenuAnchor(null)

    return (
        <>
            <IconButton
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
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                onDoubleClick={e => {
                    e.stopPropagation()
                }}
            >
                <BookmarkActionMenuContent onCloseMenu={closeMenu} />
            </Menu>
        </>
    )
}
