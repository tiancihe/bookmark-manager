import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import copyToClipboard from "copy-to-clipboard"

import { __MAC__ } from "../consts"
import { RootState } from "../types"
import { setCopiedNodes } from "../store/cnp"
import { pasteBookmarks } from "../utils/bookmark"
import { snackbarMessageSignal } from "../signals"

export function useCopyPaste() {
    const dispatch = useDispatch()
    const selectedNodes = useSelector((state: RootState) => state.dnd.selectedNodes)
    const copiedNodes = useSelector((state: RootState) => state.cnp.copied)
    const activeFolder = useSelector((state: RootState) => state.bookmark.activeFolder)
    const search = useSelector((state: RootState) => state.bookmark.search)

    // copy and paste bookmarks
    useEffect(() => {
        const copyListener = (e: KeyboardEvent) => {
            if (
                e.target === document.body &&
                e.key === "c" &&
                ((__MAC__ && e.metaKey && !e.shiftKey && !e.ctrlKey) ||
                    (!__MAC__ && e.ctrlKey && !e.shiftKey && !e.altKey))
            ) {
                if (selectedNodes.length) {
                    e.preventDefault()
                    copyToClipboard(selectedNodes.map(node => node.url ?? node.title).join("\t\n"))
                    dispatch(setCopiedNodes([...selectedNodes]))
                    snackbarMessageSignal.value = `${selectedNodes.length} items copied`
                }
            }
        }
        window.addEventListener("keydown", copyListener)

        const pasteListener = async (e: KeyboardEvent) => {
            if (
                e.target === document.body &&
                e.key === "v" &&
                ((__MAC__ && e.metaKey && !e.shiftKey && !e.ctrlKey) ||
                    (!__MAC__ && e.ctrlKey && !e.shiftKey && !e.altKey))
            ) {
                if (copiedNodes.length) {
                    e.preventDefault()
                    // only paste when not searching and a folder opened
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
        }
        window.addEventListener("keydown", pasteListener)

        return () => {
            window.removeEventListener("keydown", copyListener)
            window.removeEventListener("keydown", pasteListener)
        }
    }, [selectedNodes, copiedNodes])
}
