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
    TextField
} from "@material-ui/core"

import { useStore } from "../Store"

type CreateDetails = browser.bookmarks.CreateDetails

const useCreateBookmarkModal = makeStyles({
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    content: {
        minWidth: "500px"
    }
})

const CreateBookmarkModal: React.FC<{
    createType: "bookmark" | "folder"
    onClose: () => void
}> = ({ createType, onClose }) => {
    const { activeFolder } = useStore()

    const classNames = useCreateBookmarkModal()

    const [title, setTitle] = useState("")
    const [url, setUrl] = useState("")

    // only validates url, title can be empty
    const [urlValidationError, setUrlValidationError] = useState<string | null>(
        null
    )

    const handleSubmit = async () => {
        if (activeFolder) {
            if (createType === "bookmark" && !url) {
                setUrlValidationError("Invalid url!")
                return
            }

            const detail: CreateDetails = {
                parentId: activeFolder.id,
                title,
                url,
                type: createType
            }

            if (createType === "folder") {
                delete detail.url
            }

            try {
                await browser.bookmarks.create(detail)
                onClose()
            } catch (err) {
                console.error(err)
            }
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
                <CardHeader title="Add bookmark" />
                <CardContent>
                    <TextField
                        label="Name"
                        fullWidth
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    {createType === "bookmark" && (
                        <TextField
                            label="URL"
                            fullWidth
                            helperText={urlValidationError}
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                    )}
                </CardContent>
                <CardActions style={{ justifyContent: "flex-end" }}>
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
            </Card>
        </Modal>
    )
}

export default CreateBookmarkModal
