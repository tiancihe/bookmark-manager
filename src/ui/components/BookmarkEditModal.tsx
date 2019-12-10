import React, { useState } from "react"
import {
    makeStyles,
    Modal,
    Backdrop,
    Card,
    CardHeader,
    CardContent,
    TextField,
    CardActions,
    Button
} from "@material-ui/core"

import { BookmarkTreeNode } from "../../types"

const useStyle = makeStyles({
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    content: {
        minWidth: "500px"
    },
    actions: {
        justifyContent: "flex-end"
    }
})

const BookmarkEditModal: React.FC<{
    bookmarkNode: BookmarkTreeNode
    onClose: () => void
}> = ({ bookmarkNode, onClose }) => {
    const classNames = useStyle()

    const [title, setTitle] = useState(bookmarkNode.title)
    const [url, setUrl] = useState(bookmarkNode.url)

    const isBookmark = bookmarkNode.type === "bookmark"

    const handleSubmit = () => {
        const payload: Partial<Pick<BookmarkTreeNode, "title" | "url">> = {
            title
        }

        if (isBookmark) {
            payload.url = url
        }

        try {
            browser.bookmarks.update(bookmarkNode.id, payload)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Modal
            className={classNames.modal}
            open
            onClose={onClose}
            BackdropComponent={Backdrop}
        >
            <Card className={classNames.content}>
                <CardHeader
                    title={isBookmark ? "Edit Bookmark" : "Rename Folder"}
                />
                <CardContent>
                    <TextField
                        fullWidth
                        autoFocus
                        label="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    {isBookmark && (
                        <TextField
                            fullWidth
                            label="URL"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                    )}
                </CardContent>
                <CardActions className={classNames.actions}>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Save
                    </Button>
                </CardActions>
            </Card>
        </Modal>
    )
}

export default BookmarkEditModal
