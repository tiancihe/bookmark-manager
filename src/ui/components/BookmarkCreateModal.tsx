import React from "react"
import { useSelector } from "react-redux"
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

import { RootState, BookmarkNodeType } from "../types"

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
    createType: BookmarkNodeType
    onClose: () => void
}) {
    const activeFolder = useSelector(
        (state: RootState) => state.bookmark.activeFolder
    )

    const [title, setTitle] = React.useState("")
    const [url, setUrl] = React.useState("")
    // only validates url, title can be empty
    const [urlValidationError, setUrlValidationError] = React.useState<
        string | null
    >(null)
    const [
        showNoActiveFolderError,
        setShowNoActiveFolderError
    ] = React.useState(false)

    const classNames = useCreateBookmarkModalStyle()

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
                type: createType
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
