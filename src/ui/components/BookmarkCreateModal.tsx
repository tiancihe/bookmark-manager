import { useState } from "react"
import { Modal, Card, CardHeader, CardContent, CardActions, Button, TextField, Snackbar, Stack } from "@mui/material"

import { closeModal, useStore } from "../store"
import { BookmarkNodeType, ModalType } from "../types"
import { createBookmark } from "../utils/bookmark"

export default function CreateBookmarkModal() {
    const modalType = useStore(state => state.bookmarkModalType)
    const createType = useStore(state => state.bookmarkCreateType)
    const activeFolder = useStore(state => state.activeFolder)

    const [title, setTitle] = useState("")
    const [url, setUrl] = useState("")
    // only validates url, title can be empty
    const [urlValidationError, setUrlValidationError] = useState<string | null>(null)
    const [showNoActiveFolderError, setShowNoActiveFolderError] = useState(false)

    const handleSubmit = async () => {
        if (activeFolder !== null) {
            if (createType === BookmarkNodeType.Bookmark && !url) {
                setUrlValidationError("Url is required")
                return
            }

            await createBookmark({
                parentId: activeFolder.id,
                title,
                url,
                type: createType === BookmarkNodeType.Bookmark ? BookmarkNodeType.Bookmark : undefined,
            })

            closeModal()
        } else {
            setShowNoActiveFolderError(true)
        }
    }

    return (
        <Modal open={modalType === ModalType.BookmarkCreate} onClose={closeModal}>
            <Stack height="100%" alignItems="center" justifyContent="center">
                <Card sx={{ width: 500 }} onClick={e => e.stopPropagation()} onDoubleClick={e => e.stopPropagation()}>
                    <CardHeader title={`Add ${createType}`} />
                    <CardContent>
                        <Stack spacing={2}>
                            <TextField
                                label="Name"
                                fullWidth
                                autoFocus
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        handleSubmit()
                                    }
                                }}
                            />
                            {createType === BookmarkNodeType.Bookmark && (
                                <TextField
                                    label="URL"
                                    fullWidth
                                    helperText={urlValidationError}
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            handleSubmit()
                                        }
                                    }}
                                />
                            )}
                        </Stack>
                    </CardContent>
                    <CardActions>
                        <Stack width="100%" direction="row" justifyContent="flex-end" spacing={2}>
                            <Button variant="outlined" color="primary" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                Save
                            </Button>
                        </Stack>
                    </CardActions>
                    <Snackbar
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                        }}
                        open={showNoActiveFolderError}
                        autoHideDuration={1500}
                        onClose={() => setShowNoActiveFolderError(false)}
                        message="Select a folder on the left panel first"
                    />
                </Card>
            </Stack>
        </Modal>
    )
}
