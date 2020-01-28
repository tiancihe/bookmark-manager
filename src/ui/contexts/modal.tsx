import React from "react"

import { BookmarkTreeNode } from "../../types"

export enum ModalType {
    BookmarkEdit = "BookmarkEdit",
    BookmarkCreate = "BookmarkCreate"
}

export enum BookmarkCreateType {
    Bookmark = "bookmark",
    Folder = "folder"
}

export interface ModalState {
    modalType: ModalType
    /** exists when modalType === ModalType.BookmarkEdit */
    bookmarkNode?: BookmarkTreeNode
    /** exists when modalType === ModalType.BookmarkCreate */
    createType?: BookmarkCreateType
}

export interface ModalStore {
    modalState: ModalState | null
    openBookmarkEditModal: (node: BookmarkTreeNode) => void
    openBookmarkCreateModal: (createType: BookmarkCreateType) => void
    closeModal: () => void
}

export const ModalContext = React.createContext({} as ModalStore)

export function useModalStore() {
    return React.useContext(ModalContext)
}

export function ModalStoreProvider({ children }: React.PropsWithChildren<{}>) {
    const [modalState, setModalState] = React.useState(
        null as ModalState | null
    )

    return (
        <ModalContext.Provider
            value={{
                modalState,
                openBookmarkEditModal: node => {
                    setModalState({
                        modalType: ModalType.BookmarkEdit,
                        bookmarkNode: node
                    })
                },
                openBookmarkCreateModal: createType => {
                    setModalState({
                        modalType: ModalType.BookmarkCreate,
                        createType
                    })
                },
                closeModal: () => {
                    setModalState(null)
                }
            }}
        >
            {children}
        </ModalContext.Provider>
    )
}
