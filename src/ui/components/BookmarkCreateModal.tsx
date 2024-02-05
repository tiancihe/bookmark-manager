import { useState } from "react"
import { styled } from "@mui/material/styles"
import { useSelector } from "react-redux"
import { Modal, Backdrop, Card, CardHeader, CardContent, CardActions, Button, TextField, Snackbar } from "@mui/material"

import { RootState, BookmarkNodeType } from "../types"

const PREFIX = "BookmarkCreateModal"

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
        <StyledModal className={classes.modal} open onClose={onClose} slots={{ backdrop: Backdrop }}>
            <Card
                className={classes.content}
                onClick={e => e.stopPropagation()}
                onDoubleClick={e => e.stopPropagation()}
            >
                <CardHeader title={`Add ${createType}`} />
                <CardContent>
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
                </CardContent>
                <CardActions className={classes.actions}>
                    <Button variant="outlined" color="primary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Save
                    </Button>
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
        </StyledModal>
    )
}
