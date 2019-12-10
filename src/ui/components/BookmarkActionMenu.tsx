import React, { useState } from "react"
import {
    Menu,
    MenuItem,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Divider
} from "@material-ui/core"
import { MoreVert } from "@material-ui/icons"

import { BookmarkTreeNode } from "../../types"
import BookmarkEditModal from "./BookmarkEditModal"

const BookmarkActionMenu: React.FC<{
    bookmarkNode: BookmarkTreeNode
    className?: string
}> = ({ bookmarkNode, className }) => {
    const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null)

    const closeMenu = () => setMenuAnchor(null)

    const [showEditModal, setShowEditModal] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const handleDeleteNode = () => {
        if (bookmarkNode.children && bookmarkNode.children.length) {
            setShowConfirmModal(true)
            return
        }
        browser.bookmarks.remove(bookmarkNode.id)
    }

    const handleDeleteTree = () => {
        browser.bookmarks.removeTree(bookmarkNode.id)
    }

    return (
        <React.Fragment>
            <IconButton
                className={className}
                onClick={e => setMenuAnchor(e.currentTarget)}
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
            >
                <MenuItem
                    onClick={() => {
                        setShowEditModal(true)
                        closeMenu()
                    }}
                >
                    {bookmarkNode.type === "bookmark" ? "Edit" : "Rename"}
                </MenuItem>
                <MenuItem onClick={handleDeleteNode}>Delete</MenuItem>
                {__DEV__ && (
                    <React.Fragment>
                        <Divider />
                        <MenuItem onClick={() => console.log(bookmarkNode)}>
                            Log This
                        </MenuItem>
                    </React.Fragment>
                )}
            </Menu>
            {showEditModal && (
                <BookmarkEditModal
                    bookmarkNode={bookmarkNode}
                    onClose={() => {
                        setShowEditModal(false)
                    }}
                />
            )}
            <Dialog open={showConfirmModal}>
                <DialogTitle>Folder Not Empty!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {bookmarkNode.title} ?
                    </DialogContentText>
                    <DialogContentText>
                        All of its content will be deleted together!
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ justifyContent: "flex-end" }}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setShowConfirmModal(false)
                            closeMenu()
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleDeleteTree}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

export default BookmarkActionMenu
