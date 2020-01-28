import React, { useEffect } from "react"
import {
    CssBaseline,
    makeStyles,
    createMuiTheme,
    useMediaQuery,
    MuiThemeProvider
} from "@material-ui/core"
import { DndProvider } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"

import Navbar from "./components/Navbar"
import FolderPanel from "./components/FolderPanel"
import SubfolderPanel from "./components/SubfolderPanel"
import { useStore } from "./contexts/store"
import { useModalStore, ModalType } from "./contexts/modal"
import BookmarkEditModal from "./components/BookmarkEditModal"
import CreateBookmarkModal from "./components/BookmarkCreateModal"

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

const App: React.FC = () => {
    const { darkMode } = useStore()

    const classNames = useAppStyle()

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

    useEffect(() => {
        if (darkMode !== prefersDarkMode) {
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

    const { modalState, closeModal } = useModalStore()

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
            {modalState !== null &&
                modalState.modalType === ModalType.BookmarkEdit && (
                    <BookmarkEditModal
                        bookmarkNode={modalState.bookmarkNode!}
                        onClose={closeModal}
                    />
                )}
            {modalState !== null &&
                modalState.modalType === ModalType.BookmarkCreate && (
                    <CreateBookmarkModal
                        createType={modalState.createType!}
                        onClose={closeModal}
                    />
                )}
        </MuiThemeProvider>
    )
}

export default App
