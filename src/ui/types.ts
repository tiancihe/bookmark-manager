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
    dedupe?: "1"
}

export type Settings = {
    darkMode: boolean
    disableFavicon: boolean
    alwaysShowURL: boolean
    splitterPosition: number
}
