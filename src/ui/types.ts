import { Action } from "@reduxjs/toolkit"
import { ThunkAction } from "redux-thunk"

import { BookmarkTreeNode } from "../types"
import { reducer } from "./store"

export type RootState = ReturnType<typeof reducer>

export type AppThunkAction = ThunkAction<void, RootState, null, Action<string>>

export enum BookmarkNodeType {
    Bookmark = "bookmark",
    Folder = "folder"
}

export enum HoverArea {
    Top = "Top",
    Mid = "Mid",
    Bottom = "Bottom"
}

export interface HoverState {
    node: BookmarkTreeNode
    area: HoverArea
}

export enum ModalType {
    BookmarkEdit = "BookmarkEdit",
    BookmarkCreate = "BookmarkCreate"
}
