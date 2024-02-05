import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { CssBaseline, Snackbar } from "@mui/material"
import { makeStyles } from "@mui/styles"
import { DndProvider } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"

import { loadBookmarkTree, syncBookmarkStateFromHashParams } from "./store/bookmark"
import { resetDndState } from "./store/dnd"
import { closeModal } from "./store/modal"
import { RootState, ModalType } from "./types"
import { __MAC__, BatchingUpdateListener, BatchingUpdateManager } from "./consts"

import Navbar from "./components/Navbar"
import FolderPanel from "./components/FolderPanel"
import BookmarkPanel from "./components/BookmarkPanel"
import BookmarkEditModal from "./components/BookmarkEditModal"
import BookmarkCreateModal from "./components/BookmarkCreateModal"

const useAppStyle = makeStyles(theme => ({
    container: {
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
    },
    mainContent: {
        flex: 1,
        display: "flex",
        overflow: "hidden",
    },
    folderPanel: {
        width: "256px",
        height: "100%",
        padding: theme.spacing(1, 0.5, 0, 2),
        overflow: "auto",
    },
    displayPanel: {
        flex: 1,
        height: "100%",
        padding: theme.spacing(0, 4, 0, 2),
        overflow: "auto",
    },
}))

export default function App() {
    const bookmarkTree = useSelector((state: RootState) => state.bookmark.bookmarkTree)
    const selectedNodes = useSelector((state: RootState) => state.dnd.selectedNodes)
    const dispatch = useDispatch()

    useEffect(() => {
        const loadTree = () => {
            if (BatchingUpdateManager.state.isBatchingUpdate) {
                return
            }
            dispatch(loadBookmarkTree())
        }
        // initialize bookmarkTree
        loadTree()

        // subscribe to batching update event, loadTree on batching ends
        const batchingUpdateListener: BatchingUpdateListener = isBatchingUpdate => !isBatchingUpdate && loadTree()
        BatchingUpdateManager.subscribe(batchingUpdateListener)

        // reloads bookmarkTree when user changes any bookmarks
        browser.bookmarks.onCreated.addListener(loadTree)
        browser.bookmarks.onChanged.addListener(loadTree)
        browser.bookmarks.onRemoved.addListener(loadTree)
        browser.bookmarks.onMoved.addListener(loadTree)

        const hashChangeListener = () => dispatch(syncBookmarkStateFromHashParams())
        window.addEventListener("hashchange", hashChangeListener)

        return () => {
            BatchingUpdateManager.unsubscribe(batchingUpdateListener)

            browser.bookmarks.onCreated.removeListener(loadTree)
            browser.bookmarks.onChanged.removeListener(loadTree)
            browser.bookmarks.onRemoved.removeListener(loadTree)
            browser.bookmarks.onMoved.removeListener(loadTree)

            window.removeEventListener("hashchange", hashChangeListener)
        }
    }, [])

    // when bookmarkTree changes, sync bookmark search and activeFolder state from hash params
    // this is because searchResult and activeFolder are all refs to the current bookmark nodes
    // which will change when bookmarkTree changes
    useEffect(() => {
        if (bookmarkTree) {
            dispatch(syncBookmarkStateFromHashParams())
        }
    }, [bookmarkTree])

    useEffect(() => {
        // reset dndState when user clicks away
        const reset = () => {
            if (selectedNodes.length) {
                dispatch(resetDndState())
            }
        }
        window.addEventListener("click", reset)
        return () => window.removeEventListener("click", reset)
    }, [selectedNodes])

    const modalType = useSelector((state: RootState) => state.modal.modalType)
    const snackbarState = useSelector((state: RootState) => state.snackbar)
    const bookmarkNode = useSelector((state: RootState) => state.modal.bookmarkNode)
    const createType = useSelector((state: RootState) => state.modal.createType)

    const classNames = useAppStyle()

    return (
        <>
            <div className={classNames.container}>
                <CssBaseline />
                <Navbar />
                <DndProvider backend={HTML5Backend}>
                    <div className={classNames.mainContent}>
                        <FolderPanel className={classNames.folderPanel} />
                        <BookmarkPanel className={classNames.displayPanel} />
                    </div>
                </DndProvider>
            </div>
            {modalType === ModalType.BookmarkEdit && (
                <BookmarkEditModal bookmarkNode={bookmarkNode!} onClose={() => dispatch(closeModal())} />
            )}
            {modalType === ModalType.BookmarkCreate && (
                <BookmarkCreateModal createType={createType!} onClose={() => dispatch(closeModal())} />
            )}
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                open={snackbarState.visible}
                message={snackbarState.message}
            />
        </>
    )
}
