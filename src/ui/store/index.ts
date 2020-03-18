import { configureStore, combineReducers } from "@reduxjs/toolkit"
import thunk from "redux-thunk"

import { bookmark } from "./bookmark"
import { dnd } from "./dnd"
import { cnp } from "./cnp"
import { modal } from "./modal"
import { setting } from "./setting"

export const reducer = combineReducers({
    bookmark,
    dnd,
    cnp,
    modal,
    setting
})

const middleware = [thunk]

const store = configureStore({
    reducer,
    middleware
})

if (__DEV__) {
    window.__REDUX_STORE__ = store
}

export default store
