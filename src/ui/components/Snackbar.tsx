import { Button, Snackbar } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"

import { clearSnackbarMessage } from "../store/message"
import { bookmarkActionHistory } from "../utils/bookmark"
import { RootState } from "../types"

export default function GlobalSnackbar() {
    const snackbarMessage = useSelector((state: RootState) => state.message.snackbarMessage)
    const dispatch = useDispatch()
    return (
        <Snackbar
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            open={!!snackbarMessage}
            onClose={() => {
                dispatch(clearSnackbarMessage())
            }}
            autoHideDuration={8000}
            message={snackbarMessage}
            action={
                <Button
                    variant="text"
                    onClick={() => {
                        bookmarkActionHistory.undo()
                        dispatch(clearSnackbarMessage())
                    }}
                >
                    Undo
                </Button>
            }
        />
    )
}
