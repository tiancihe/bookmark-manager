import { useEffect } from "react"
import { clearSelectedBookmarkNodes, useStore } from "../store"

export const useAutoClearSelectedBookmarks = () => {
    const selectedBookmarks = useStore(state => state.selectedBookmarkNodes)

    useEffect(() => {
        // clear selected bookmarks when user clicks away
        const reset = () => {
            if (selectedBookmarks.length) {
                clearSelectedBookmarkNodes()
            }
        }
        window.addEventListener("click", reset)
        return () => window.removeEventListener("click", reset)
    }, [selectedBookmarks])
}
