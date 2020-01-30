import { createSlice } from "@reduxjs/toolkit"

const slice = createSlice({
    name: "Setting",
    initialState: {
        darkMode: false
    },
    reducers: {
        toggleDarkMode(state) {
            state.darkMode = !state.darkMode
        }
    }
})

export const { toggleDarkMode } = slice.actions

export const setting = slice.reducer
