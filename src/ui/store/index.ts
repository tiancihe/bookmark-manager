import { configureStore, combineReducers } from "@reduxjs/toolkit"
import thunk from "redux-thunk"
import logger from "redux-logger"

import { bookmark } from "./bookmark"
import { dnd } from "./dnd"
import { modal } from "./modal"
import { setting } from "./setting"

export const reducer = combineReducers({
    bookmark,
    dnd,
    modal,
    setting
})

const middleware = [thunk]
if (__DEV__) {
    middleware.push(logger)
}

const store = configureStore({
    reducer,
    middleware
})

export default store
