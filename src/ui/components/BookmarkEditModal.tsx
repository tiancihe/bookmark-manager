import { useState } from "react"
import { Modal, Card, CardHeader, CardContent, TextField, CardActions, Button, Stack } from "@mui/material"

import { BookmarkTreeNode } from "../types"
import { isNodeBookmark, updateBookmark } from "../utils/bookmark"

export default function BookmarkEditModal({
    bookmarkNode,
    onClose,
}: {
    bookmarkNode: BookmarkTreeNode
    onClose: () => void
}) {
    const [title, setTitle] = useState(bookmarkNode.title)
    const [url, setUrl] = useState(bookmarkNode.url)

    const isBookmark = isNodeBookmark(bookmarkNode)

    const handleSubmit = async () => {
        try {
            await updateBookmark(bookmarkNode.id, {
                title,
                url: isBookmark ? url : undefined,
            })
            onClose()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Modal open onClose={onClose}>
            <Stack height="100%" alignItems="center" justifyContent="center">
                <Card sx={{ width: 500 }} onClick={e => e.stopPropagation()} onDoubleClick={e => e.stopPropagation()}>
                    <CardHeader title={isBookmark ? "Edit Bookmark" : "Rename Folder"} />
                    <CardContent>
                        <Stack spacing={2}>
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
                        </Stack>
                    </CardContent>
                    <CardActions>
                        <Stack width="100%" direction="row" justifyContent="flex-end" spacing={2}>
                            <Button variant="outlined" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                Save
                            </Button>
                        </Stack>
                    </CardActions>
                </Card>
            </Stack>
        </Modal>
    )
}
