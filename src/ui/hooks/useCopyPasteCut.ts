import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import copyToClipboard from "copy-to-clipboard"

import { __MAC__ } from "../consts"
import { RootState } from "../types"
import { setCopiedNodes } from "../store/cnp"
import { setSnackbarMessage } from "../store/message"
import { pasteBookmarks, removeBookmarks } from "../utils/bookmark"

export function useCopyPasteCut() {
    const dispatch = useDispatch()
    const selectedNodes = useSelector((state: RootState) => state.dnd.selectedNodes)
    const copiedNodes = useSelector((state: RootState) => state.cnp.copied)
    const activeFolder = useSelector((state: RootState) => state.bookmark.activeFolder)
    const search = useSelector((state: RootState) => state.bookmark.search)

    // copy and paste and cut bookmarks
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (
                e.target === document.body &&
                e.key === "c" &&
                !e.shiftKey &&
                ((__MAC__ && e.metaKey && !e.ctrlKey) || (!__MAC__ && e.ctrlKey && !e.altKey))
            ) {
                if (selectedNodes.length) {
                    e.preventDefault()
                    copyToClipboard(selectedNodes.map(node => node.url ?? node.title).join("\t\n"))
                    dispatch(setCopiedNodes([...selectedNodes]))
                    dispatch(setSnackbarMessage(`${selectedNodes.length} items copied`))
                }
                return
            }

            if (
                e.target === document.body &&
                e.key === "v" &&
                !e.shiftKey &&
                ((__MAC__ && e.metaKey && !e.ctrlKey) || (!__MAC__ && e.ctrlKey && !e.altKey))
            ) {
                if (copiedNodes.length) {
                    e.preventDefault()
                    // only paste when not searching and inside a folder
                    if (!search && activeFolder) {
                        // paste copied nodes after the last of the selected nodes or append in the children of the current folder
                        const target = selectedNodes[selectedNodes.length - 1]
                        pasteBookmarks({
                            src: copiedNodes,
                            dest: activeFolder,
                            destIndex: target ? target.index! : undefined,
                        })
                    }
                }
            }

            if (
                e.target === document.body &&
                e.key === "x" &&
                !e.shiftKey &&
                ((__MAC__ && e.metaKey && !e.ctrlKey) || (!__MAC__ && e.ctrlKey && !e.altKey))
            ) {
                if (selectedNodes.length) {
                    e.preventDefault()
                    copyToClipboard(selectedNodes.map(node => node.url ?? node.title).join("\t\n"))
                    dispatch(setCopiedNodes([...selectedNodes]))
                    removeBookmarks(selectedNodes)
                    dispatch(setSnackbarMessage(`${selectedNodes.length} items cut`))
                }
            }
        }
        window.addEventListener("keydown", listener)
        return () => window.removeEventListener("keydown", listener)
    }, [selectedNodes, copiedNodes])
}
