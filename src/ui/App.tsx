import { CssBaseline, Stack } from "@mui/material"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import { useSyncStateFromHashParams } from "./hooks/useSyncStateFromHashParams"
import { useAutoClearSelectedBookmarks } from "./hooks/useAutoClearSelectedBookmarks"
import { useUndoRedo } from "./hooks/useUndoRedo"
import Navbar from "./components/Navbar"
import FolderPanel from "./components/FolderPanel"
import BookmarkPanel from "./components/BookmarkPanel"
import BookmarkEditModal from "./components/BookmarkEditModal"
import BookmarkCreateModal from "./components/BookmarkCreateModal"
import Splitter from "./components/Splitter"
import GlobalSnackbar from "./components/Snackbar"

export default function App() {
    useSyncStateFromHashParams()
    useAutoClearSelectedBookmarks()
    useUndoRedo()

    return (
        <>
            <CssBaseline />
            <Stack width="100vw" height="100vh">
                <Navbar />
                <DndProvider backend={HTML5Backend}>
                    <Stack direction="row" flexGrow={1} overflow="hidden">
                        <FolderPanel />
                        <Splitter />
                        <BookmarkPanel />
                    </Stack>
                </DndProvider>
            </Stack>
            <BookmarkEditModal />
            <BookmarkCreateModal />
            <GlobalSnackbar />
        </>
    )
}
