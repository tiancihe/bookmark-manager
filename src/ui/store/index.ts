import { configureStore, combineReducers } from "@reduxjs/toolkit"
import thunk from "redux-thunk"

import { bookmark } from "./bookmark"
import { dnd } from "./dnd"
import { cnp } from "./cnp"
import { modal } from "./modal"
import { message } from "./message"

export const reducer = combineReducers({
    bookmark,
    dnd,
    cnp,
    modal,
    message,
})

const middleware = [thunk]

const store = configureStore({
    reducer,
    middleware,
})

if (__DEV__) {
    // @ts-ignore
    window.__REDUX_STORE__ = store
}

export default store
