import { useState } from "react"
import { styled } from "@mui/material/styles"
import { Modal, Backdrop, Card, CardHeader, CardContent, TextField, CardActions, Button } from "@mui/material"

import { BookmarkTreeNode } from "../../types"
import { BookmarkNodeType } from "../types"

const PREFIX = "BookmarkEditModal"

const classes = {
    modal: `${PREFIX}-modal`,
    content: `${PREFIX}-content`,
    actions: `${PREFIX}-actions`,
}

const StyledModal = styled(Modal)({
    [`& .${classes.modal}`]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    [`& .${classes.content}`]: {
        minWidth: "500px",
    },
    [`& .${classes.actions}`]: {
        justifyContent: "flex-end",
    },
})

export default function BookmarkEditModal({
    bookmarkNode,
    onClose,
}: {
    bookmarkNode: BookmarkTreeNode
    onClose: () => void
}) {
    const [title, setTitle] = useState(bookmarkNode.title)
    const [url, setUrl] = useState(bookmarkNode.url)

    const isBookmark = bookmarkNode.type === BookmarkNodeType.Bookmark

    const handleSubmit = async () => {
        const payload: Partial<Pick<BookmarkTreeNode, "title" | "url">> = {
            title,
        }

        if (isBookmark) {
            payload.url = url
        }

        try {
            await browser.bookmarks.update(bookmarkNode.id, payload)
            onClose()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <StyledModal className={classes.modal} open onClose={onClose} BackdropComponent={Backdrop}>
            <Card
                className={classes.content}
                onClick={e => e.stopPropagation()}
                onDoubleClick={e => e.stopPropagation()}
            >
                <CardHeader title={isBookmark ? "Edit Bookmark" : "Rename Folder"} />
                <CardContent>
                    <TextField
                        fullWidth
                        autoFocus
                        label="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                e.stopPropagation()
                                handleSubmit()
                            }
                        }}
                    />
                    {isBookmark && (
                        <TextField
                            fullWidth
                            label="URL"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    e.stopPropagation()
                                    handleSubmit()
                                }
                            }}
                        />
                    )}
                </CardContent>
                <CardActions className={classes.actions}>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Save
                    </Button>
                </CardActions>
            </Card>
        </StyledModal>
    )
}
