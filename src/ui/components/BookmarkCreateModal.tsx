import React, { useState } from "react"
import {
    makeStyles,
    Modal,
    Backdrop,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Button,
    TextField,
    Snackbar
} from "@material-ui/core"

import { useStore } from "../contexts/store"
import { BookmarkCreateType } from "../contexts/modal"

type CreateDetails = browser.bookmarks.CreateDetails

const useCreateBookmarkModalStyle = makeStyles({
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

export default function CreateBookmarkModal({
    createType,
    onClose
}: {
    createType: BookmarkCreateType
    onClose: () => void
}) {
    const { activeFolderId } = useStore()

    const classNames = useCreateBookmarkModalStyle()

    const [title, setTitle] = useState("")
    const [url, setUrl] = useState("")

    // only validates url, title can be empty
    const [urlValidationError, setUrlValidationError] = useState<string | null>(
        null
    )

    const [showNoActiveFolderError, setShowNoActiveFolderError] = useState(
        false
    )

    const handleSubmit = async () => {
        if (activeFolderId) {
            if (createType === BookmarkCreateType.Bookmark && !url) {
                setUrlValidationError("Url is required")
                return
            }

            const detail: CreateDetails = {
                parentId: activeFolderId,
                title,
                url,
                type: createType
            }

            if (createType === BookmarkCreateType.Folder) {
                delete detail.url
            }

            await browser.bookmarks.create(detail)

            onClose()
        } else {
            setShowNoActiveFolderError(true)
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
                <CardHeader title={`Add ${createType}`} />
                <CardContent>
                    <TextField
                        label="Name"
                        fullWidth
                        autoFocus
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    {createType === BookmarkCreateType.Bookmark && (
                        <TextField
                            label="URL"
                            fullWidth
                            helperText={urlValidationError}
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                    )}
                </CardContent>
                <CardActions className={classNames.actions}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={onClose}
                    >
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
                <Snackbar
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left"
                    }}
                    open={showNoActiveFolderError}
                    autoHideDuration={1500}
                    onClose={() => setShowNoActiveFolderError(false)}
                    message="Select a folder on the left panel first"
                />
            </Card>
        </Modal>
    )
}
