import { useEffect, useState } from "react"
import {
    Modal,
    Card,
    CardHeader,
    CardContent,
    TextField,
    CardActions,
    Button,
    Stack,
} from "@mui/material"

import { closeModal, setSnackbarMessage, useStore } from "../store"
import {
    createBookmark,
    isNodeBookmark,
    updateBookmark,
} from "../utils/bookmark"
import { BookmarkNodeType, ModalType } from "../types"

export default function BookmarkEditModal() {
    const activeFolder = useStore(state => state.activeFolder)
    const { modalType, bookmarkNode, createType } = useStore(
        state => state.bookmarkEditModal,
    )

    const [title, setTitle] = useState(bookmarkNode?.title || "")
    const [url, setUrl] = useState(bookmarkNode?.url || "")
    // only validates url, title can be empty
    const [urlValidationError, setUrlValidationError] = useState<string | null>(
        null,
    )

    useEffect(() => {
        setTitle("")
        setUrl("")
    }, [modalType])

    useEffect(() => {
        if (bookmarkNode) {
            setTitle(bookmarkNode.title || "")
            setUrl(bookmarkNode.url || "")
        }
    }, [bookmarkNode])

    const isCreate = modalType === ModalType.BookmarkCreate
    const isEdit = modalType === ModalType.BookmarkEdit
    const isBookmark = bookmarkNode ? isNodeBookmark(bookmarkNode) : false

    const handleSubmit = async () => {
        try {
            if (isCreate) {
                if (!activeFolder) {
                    throw new Error("Please select a folder first")
                }
                if (createType === BookmarkNodeType.Bookmark && !url) {
                    setUrlValidationError("Url is required")
                    return
                }

                await createBookmark({
                    parentId: activeFolder.id,
                    title,
                    url,
                    type:
                        createType === BookmarkNodeType.Bookmark
                            ? BookmarkNodeType.Bookmark
                            : undefined,
                })
                closeModal()
            } else if (isEdit) {
                if (isBookmark && !url) {
                    setUrlValidationError("Url is required")
                    return
                }
                await updateBookmark(bookmarkNode!.id, {
                    title,
                    url: isBookmark ? url : undefined,
                })
                closeModal()
            }
        } catch (err) {
            if (err instanceof Error && err.message) {
                setSnackbarMessage(err.message, false)
                closeModal()
            }
        }
    }

    return (
        <Modal open={modalType !== null} onClose={closeModal}>
            <Stack height="100%" alignItems="center" justifyContent="center">
                <Card
                    sx={{ width: 500 }}
                    onClick={e => e.stopPropagation()}
                    onDoubleClick={e => e.stopPropagation()}
                >
                    <CardHeader
                        title={
                            isCreate
                                ? `Add ${createType}`
                                : isBookmark
                                  ? "Edit Bookmark"
                                  : "Rename Folder"
                        }
                    />
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
                            {(isCreate &&
                                createType === BookmarkNodeType.Bookmark) ||
                            (isEdit && isBookmark) ? (
                                <TextField
                                    fullWidth
                                    label="URL"
                                    error={!!urlValidationError}
                                    helperText={urlValidationError}
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            e.stopPropagation()
                                            handleSubmit()
                                        }
                                    }}
                                />
                            ) : null}
                        </Stack>
                    </CardContent>
                    <CardActions>
                        <Stack
                            width="100%"
                            direction="row"
                            justifyContent="flex-end"
                            spacing={2}
                        >
                            <Button variant="outlined" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                            >
                                Save
                            </Button>
                        </Stack>
                    </CardActions>
                </Card>
            </Stack>
        </Modal>
    )
}
