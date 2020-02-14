import React from "react"
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
import { BookmarkNodeType } from "../types"

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

export default function BookmarkEditModal({
    bookmarkNode,
    onClose
}: {
    bookmarkNode: BookmarkTreeNode
    onClose: () => void
}) {
    const [title, setTitle] = React.useState(bookmarkNode.title)
    const [url, setUrl] = React.useState(bookmarkNode.url)

    const isBookmark = bookmarkNode.type === BookmarkNodeType.Bookmark

    const handleSubmit = async () => {
        const payload: Partial<Pick<BookmarkTreeNode, "title" | "url">> = {
            title
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

    const classNames = useStyle()

    return (
        <Modal
            className={classNames.modal}
            open
            onClose={onClose}
            BackdropComponent={Backdrop}
        >
            <Card
                className={classNames.content}
                onClick={e => e.stopPropagation()}
                onDoubleClick={e => e.stopPropagation()}
            >
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
                        onKeyDown={e => {
                            if (e.key === "Enter") {
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
                                    handleSubmit()
                                }
                            }}
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
