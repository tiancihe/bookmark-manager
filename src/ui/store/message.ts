import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const slice = createSlice({
    name: "message",
    initialState: {
        snackbarMessage: "",
    },
    reducers: {
        setSnackbarMessage(state, { payload }: PayloadAction<string>) {
            state.snackbarMessage = payload
        },
        clearSnackbarMessage(state) {
            state.snackbarMessage = ""
        },
    },
})

export const { setSnackbarMessage, clearSnackbarMessage } = slice.actions

export const message = slice.reducer
