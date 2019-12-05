import React, { useState } from "react"
import {
    makeStyles,
    Modal,
    Backdrop,
    Fade,
    ListItemIcon,
    ListItemText,
    Card,
    CardHeader,
    CardContent,
    TextField,
    CardActions,
    Button
} from "@material-ui/core"
import { Edit } from "@material-ui/icons"

import { BookmarkTreeNode } from "../../types"

const useStyle = makeStyles({
    trigger: {
        display: "flex"
    },
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    actions: {
        justifyContent: "flex-end"
    }
})

const BookmarkEditModal: React.FC<{ bookmarkNode: BookmarkTreeNode }> = ({
    bookmarkNode
}) => {
    const classNames = useStyle()
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: bookmarkNode.title,
        url: bookmarkNode.url
    } as Pick<BookmarkTreeNode, "title" | "url">)

    const isBookmark = bookmarkNode.type === "bookmark"

    const handleCloseModal = () => setOpen(false)

    const handleSubmit = () => {
        browser.bookmarks.update(bookmarkNode.id, formData)
    }

    return (
        <React.Fragment>
            <div className={classNames.trigger} onClick={() => setOpen(true)}>
                <ListItemIcon>
                    <Edit />
                </ListItemIcon>
                <ListItemText primary={isBookmark ? "Edit" : "Rename"} />
            </div>
            <Modal
                className={classNames.modal}
                open={open}
                onClose={handleCloseModal}
                BackdropComponent={Backdrop}
            >
                <Fade in={open}>
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader
                                title={
                                    isBookmark
                                        ? "Edit Bookmark"
                                        : "Rename Folder"
                                }
                            />
                            <CardContent>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    value={formData.title}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value
                                        })
                                    }
                                />
                                {isBookmark && (
                                    <TextField
                                        fullWidth
                                        label="URL"
                                        value={formData.url}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                url: e.target.value
                                            })
                                        }
                                    />
                                )}
                            </CardContent>
                            <CardActions className={classNames.actions}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                >
                                    Save
                                </Button>
                            </CardActions>
                        </Card>
                    </form>
                </Fade>
            </Modal>
        </React.Fragment>
    )
}

export default BookmarkEditModal
