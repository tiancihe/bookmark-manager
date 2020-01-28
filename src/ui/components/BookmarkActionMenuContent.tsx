import React from "react"
import {
    MenuItem,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from "@material-ui/core"

import { BookmarkTreeNode } from "../../types"

import { useModalStore } from "../contexts/modal"

export default function BookmarkActionMenuContent({
    bookmarkNode,
    onCloseMenu
}: {
    bookmarkNode: BookmarkTreeNode
    onCloseMenu: () => void
}) {
    const { openBookmarkEditModal } = useModalStore()

    const [showConfirmModal, setShowConfirmModal] = React.useState(false)

    return (
        <React.Fragment>
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    openBookmarkEditModal(bookmarkNode)
                    onCloseMenu()
                }}
            >
                {bookmarkNode.type === "bookmark" ? "Edit" : "Rename"}
            </MenuItem>
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    if (bookmarkNode.children && bookmarkNode.children.length) {
                        setShowConfirmModal(true)
                    } else {
                        browser.bookmarks.remove(bookmarkNode.id)
                    }
                }}
            >
                Delete
            </MenuItem>
            <Divider />
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    browser.tabs.create({
                        url: bookmarkNode.url
                        // active: true
                    })
                    onCloseMenu()
                }}
            >
                Open in new tab
            </MenuItem>
            <MenuItem
                onClick={e => {
                    e.stopPropagation()
                    browser.windows.create({
                        url: bookmarkNode.url
                    })
                    onCloseMenu()
                }}
            >
                Open in new window
            </MenuItem>
            {/** @todo Error: Extension does not have permission for incognito mode */}
            {/* <MenuItem
                    onClick={e => {
                        e.stopPropagation()
                        browser.windows.create({
                            url: bookmarkNode.url,
                            incognito: true
                        })
                        onClose()
                    }}
                >
                    Open in incognito window
                </MenuItem> */}
            {__DEV__ && (
                <React.Fragment>
                    <Divider />
                    <MenuItem onClick={() => console.log(bookmarkNode)}>
                        Log
                    </MenuItem>
                </React.Fragment>
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
                        onClick={e => {
                            e.stopPropagation()
                            setShowConfirmModal(false)
                            onCloseMenu()
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={e => {
                            e.stopPropagation()
                            browser.bookmarks.removeTree(bookmarkNode.id)
                            onCloseMenu()
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}
