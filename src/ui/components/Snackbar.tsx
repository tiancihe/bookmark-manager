import { Button, Snackbar } from "@mui/material"

import { bookmarkActionHistory } from "../utils/bookmark"
import { clearSnackbarMessage, useStore } from "../store"

export default function GlobalSnackbar() {
    const { message, showUndoAction } = useStore(state => state.snackbar)

    return (
        <Snackbar
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            open={!!message}
            onClose={() => {
                clearSnackbarMessage()
            }}
            autoHideDuration={8000}
            message={message}
            action={
                showUndoAction ? (
                    <Button
                        variant="text"
                        onClick={() => {
                            bookmarkActionHistory.undo()
                            clearSnackbarMessage()
                        }}
                    >
                        Undo
                    </Button>
                ) : null
            }
        />
    )
}
