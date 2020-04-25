import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppThunkAction } from "../types"

const slice = createSlice({
    name: "snackbar",
    initialState: {
        visible: false,
        message: ""
    },
    reducers: {
        setSnackbarState: (state, { payload }: PayloadAction<{ visible?: boolean; message?: string }>) => {
            if (payload.visible !== undefined) state.visible = payload.visible
            if (payload.message !== undefined) state.message = payload.message
        },
        hideSnackbar: state => {
            state.visible = false
            state.message = ""
        }
    }
})

export const { setSnackbarState, hideSnackbar } = slice.actions

export const snackbar = slice.reducer

let autoHideSnackbarTimeout = null as null | number

export function showSnackbar({
    message,
    autoHideDuration = 2000
}: {
    message: string
    autoHideDuration?: number
}): AppThunkAction {
    return async dispatch => {
        dispatch(setSnackbarState({ visible: true, message }))
        if (autoHideSnackbarTimeout) clearTimeout(autoHideSnackbarTimeout)
        autoHideSnackbarTimeout = window.setTimeout(() => {
            dispatch(hideSnackbar())
        }, autoHideDuration)
    }
}
