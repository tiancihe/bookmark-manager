import { useState } from "react"
import { useSelector } from "react-redux"
import { Modal, Card, CardHeader, CardContent, CardActions, Button, TextField, Snackbar, Stack } from "@mui/material"

import { RootState, BookmarkNodeType } from "../types"

type CreateDetails = browser.bookmarks.CreateDetails

export default function CreateBookmarkModal({
    createType,
    onClose,
}: {
    createType: BookmarkNodeType
    onClose: () => void
}) {
    const activeFolder = useSelector((state: RootState) => state.bookmark.activeFolder)

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

            const detail: CreateDetails = {
                parentId: activeFolder.id,
                title,
                url,
                type: createType,
            }

            if (createType === BookmarkNodeType.Folder) {
                delete detail.url
            }

            await browser.bookmarks.create(detail)

            onClose()
        } else {
            setShowNoActiveFolderError(true)
        }
    }

    return (
        <Modal open onClose={onClose}>
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
                            <Button variant="outlined" color="primary" onClick={onClose}>
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
