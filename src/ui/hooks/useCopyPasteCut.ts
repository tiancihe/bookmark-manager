import { useEffect } from "react"
import copyToClipboard from "copy-to-clipboard"

import { __MAC__ } from "../consts"
import { pasteBookmarks, removeBookmarks } from "../utils/bookmark"
import { useStore, setCopiedBookmarkNodes } from "../store"

export function useCopyPasteCut() {
    const selectedBookmarks = useStore(state => state.selectedBookmarkNodes)
    const copiedBookmarks = useStore(state => state.copiedBookmarkNodes)
    const activeFolder = useStore(state => state.activeFolder)
    const search = useStore(state => state.search)

    // copy and paste and cut bookmarks
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (
                e.target === document.body &&
                e.key === "c" &&
                !e.shiftKey &&
                ((__MAC__ && e.metaKey && !e.ctrlKey) || (!__MAC__ && e.ctrlKey && !e.altKey))
            ) {
                if (selectedBookmarks.length) {
                    e.preventDefault()
                    copyToClipboard(selectedBookmarks.map(node => node.url ?? node.title).join("\t\n"))
                    setCopiedBookmarkNodes([...selectedBookmarks], `${selectedBookmarks.length} items copied`)
                }
                return
            }

            if (
                e.target === document.body &&
                e.key === "v" &&
                !e.shiftKey &&
                ((__MAC__ && e.metaKey && !e.ctrlKey) || (!__MAC__ && e.ctrlKey && !e.altKey))
            ) {
                if (copiedBookmarks.length) {
                    e.preventDefault()
                    // only paste when not searching and inside a folder
                    if (!search && activeFolder) {
                        // paste copied nodes after the last of the selected nodes or append in the children of the current folder
                        const target = selectedBookmarks[selectedBookmarks.length - 1]
                        pasteBookmarks({
                            src: copiedBookmarks,
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
                if (selectedBookmarks.length) {
                    e.preventDefault()
                    copyToClipboard(selectedBookmarks.map(node => node.url ?? node.title).join("\t\n"))
                    removeBookmarks(selectedBookmarks)
                    setCopiedBookmarkNodes([...selectedBookmarks], `${selectedBookmarks.length} items cut`)
                }
            }
        }
        window.addEventListener("keydown", listener)
        return () => window.removeEventListener("keydown", listener)
    }, [selectedBookmarks, copiedBookmarks])
}
