import { Action } from "@reduxjs/toolkit"
import { ThunkAction } from "redux-thunk"

import { reducer } from "./store"

export type RootState = ReturnType<typeof reducer>

export type AppThunkAction = ThunkAction<void, RootState, null, Action<string>>

export type BookmarkTreeNode = browser.bookmarks.BookmarkTreeNode

export enum BookmarkNodeType {
    Bookmark = "bookmark",
    Folder = "folder",
}

export enum HoverArea {
    Top = "Top",
    Mid = "Mid",
    Bottom = "Bottom",
}

export enum ModalType {
    BookmarkEdit = "BookmarkEdit",
    BookmarkCreate = "BookmarkCreate",
}

export interface HashParams {
    search?: string
    folder?: string
}

export type Settings = {
    darkMode: boolean
    disableFavicon: boolean
    alwaysShowURL: boolean
    splitterPosition: number
}
