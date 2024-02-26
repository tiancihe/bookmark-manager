import { Button, Snackbar } from "@mui/material"

import { bookmarkActionHistory } from "../utils/bookmark"
import { clearSnackbarMessage, useStore } from "../store"

export default function GlobalSnackbar() {
    const snackbarMessage = useStore(state => state.snackbarMessage)

    return (
        <Snackbar
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            open={!!snackbarMessage}
            onClose={() => {
                clearSnackbarMessage()
            }}
            autoHideDuration={8000}
            message={snackbarMessage}
            action={
                <Button
                    variant="text"
                    onClick={() => {
                        bookmarkActionHistory.undo()
                        clearSnackbarMessage()
                    }}
                >
                    Undo
                </Button>
            }
        />
    )
}
