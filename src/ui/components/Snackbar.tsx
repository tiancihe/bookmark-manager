import { Button, Snackbar } from "@mui/material"
import { useSignals } from "@preact/signals-react/runtime"

import { snackbarMessageSignal } from "../signals"
import { bookmarkActionHistory } from "../utils/bookmark"

export default function GlobalSnackbar() {
    useSignals()
    return (
        <Snackbar
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            open={!!snackbarMessageSignal.value}
            onClose={() => (snackbarMessageSignal.value = "")}
            autoHideDuration={8000}
            message={snackbarMessageSignal.value}
            action={
                <Button
                    variant="text"
                    onClick={() => {
                        bookmarkActionHistory.undo()
                        snackbarMessageSignal.value = ""
                    }}
                >
                    Undo
                </Button>
            }
        />
    )
}
