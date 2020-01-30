import React from "react"
import { useSelector, useDispatch } from "react-redux"
import {
    CssBaseline,
    makeStyles,
    createMuiTheme,
    useMediaQuery,
    MuiThemeProvider
} from "@material-ui/core"
import { DndProvider } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import { once } from "lodash"

import { loadBookmarkTree, searchBookmark } from "./store/bookmark"
import { selectNodes, resetDndState } from "./store/dnd"
import { closeModal } from "./store/modal"
import { toggleDarkMode } from "./store/setting"
import { RootState, ModalType } from "./types"
import { getHashParams } from "./utils"
import { __MAC__ } from "./consts"

import Navbar from "./components/Navbar"
import FolderPanel from "./components/FolderPanel"
import SubfolderPanel from "./components/SubfolderPanel"
import BookmarkEditModal from "./components/BookmarkEditModal"
import BookmarkCreateModal from "./components/BookmarkCreateModal"

const useAppStyle = makeStyles(theme => ({
    container: {
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh"
    },
    mainContent: {
        flex: 1,
        display: "flex",
        overflow: "hidden"
    },
    folderPanel: {
        width: "256px",
        height: "100%",
        padding: theme.spacing(1, 0.5, 0, 2),
        overflow: "auto"
    },
    subfolderPanel: {
        flex: 1,
        height: "100%",
        padding: theme.spacing(0, 4, 0, 2),
        overflow: "auto"
    }
}))

export default function App() {
    const bookmarkTree = useSelector(
        (state: RootState) => state.bookmark.bookmarkTree
    )
    const activeFolder = useSelector(
        (state: RootState) => state.bookmark.activeFolder
    )
    const searchResult = useSelector(
        (state: RootState) => state.bookmark.searchResult
    )
    const selectedNodes = useSelector(
        (state: RootState) => state.dnd.selectedNodes
    )
    const dispatch = useDispatch()

    React.useEffect(() => {
        const loadTree = () => dispatch(loadBookmarkTree())
        loadTree()

        browser.bookmarks.onCreated.addListener(loadTree)
        browser.bookmarks.onChanged.addListener(loadTree)
        browser.bookmarks.onRemoved.addListener(loadTree)
        browser.bookmarks.onMoved.addListener(loadTree)

        return () => {
            browser.bookmarks.onCreated.removeListener(loadTree)
            browser.bookmarks.onChanged.removeListener(loadTree)
            browser.bookmarks.onRemoved.removeListener(loadTree)
            browser.bookmarks.onMoved.removeListener(loadTree)
        }
    }, [])

    React.useEffect(() => {
        if (bookmarkTree) {
            once(() => {
                console.log("search bookmark onDidMount")
                // if search param exists, search bookmark onDidMount
                // this is due to the fact that browser.bookmarks.search is an async function
                // and we want to search the bookmark after the bookmarkTree loads
                const { search } = getHashParams() as { search: string }
                if (search) {
                    dispatch(searchBookmark(search))
                }
            })()
        }
    }, [bookmarkTree])

    React.useEffect(() => {
        // reset dndState when user clicks away
        const reset = () => {
            if (selectedNodes.length) {
                dispatch(resetDndState())
            }
        }
        window.addEventListener("click", reset)
        return () => window.removeEventListener("click", reset)
    }, [selectedNodes])

    React.useEffect(() => {
        // capture select all hotkey
        const selectAll = (e: KeyboardEvent) => {
            if (
                e.key === "a" &&
                ((!__MAC__ && e.ctrlKey) || (__MAC__ && e.metaKey))
            ) {
                if (searchResult.length) {
                    dispatch(selectNodes(searchResult))
                } else if (
                    activeFolder &&
                    activeFolder.children &&
                    activeFolder.children.length
                ) {
                    e.preventDefault()
                    dispatch(selectNodes(activeFolder.children))
                }
            }
        }
        window.addEventListener("keydown", selectAll)
        return () => window.removeEventListener("keydown", selectAll)
    }, [searchResult, activeFolder])

    const modalType = useSelector((state: RootState) => state.modal.modalType)
    const bookmarkNode = useSelector(
        (state: RootState) => state.modal.bookmarkNode
    )
    const createType = useSelector((state: RootState) => state.modal.createType)

    const darkMode = useSelector((state: RootState) => state.setting.darkMode)
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
    React.useEffect(() => {
        if (darkMode !== prefersDarkMode) {
            dispatch(toggleDarkMode())
        }
    }, [prefersDarkMode])
    const theme = React.useMemo(() => {
        return createMuiTheme({
            palette: {
                type: darkMode ? "dark" : "light",
                primary: {
                    main: "#3367d6"
                }
            }
        })
    }, [darkMode])
    const classNames = useAppStyle()

    return (
        <MuiThemeProvider theme={theme}>
            <div className={classNames.container}>
                <CssBaseline />
                <Navbar />
                <DndProvider backend={HTML5Backend}>
                    <div className={classNames.mainContent}>
                        <FolderPanel className={classNames.folderPanel} />
                        <SubfolderPanel className={classNames.subfolderPanel} />
                    </div>
                </DndProvider>
            </div>
            {modalType === ModalType.BookmarkEdit && (
                <BookmarkEditModal
                    bookmarkNode={bookmarkNode!}
                    onClose={() => dispatch(closeModal())}
                />
            )}
            {modalType === ModalType.BookmarkCreate && (
                <BookmarkCreateModal
                    createType={createType!}
                    onClose={() => dispatch(closeModal())}
                />
            )}
        </MuiThemeProvider>
    )
}
