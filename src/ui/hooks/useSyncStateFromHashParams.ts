import { useEffect } from "react"
import { BatchingUpdateListener, BatchingUpdateManager } from "../consts"
import { loadBookmarkTree, syncStateFromHashParams, useStore } from "../store"

export const useSyncStateFromHashParams = () => {
    const bookmarkTree = useStore(state => state.bookmarkTree)

    useEffect(() => {
        const loadTree = () => {
            if (BatchingUpdateManager.state.isBatchingUpdate) {
                return
            }
            loadBookmarkTree()
        }
        // initialize bookmarkTree
        loadTree()

        // subscribe to batching update event, loadTree on batching ends
        const batchingUpdateListener: BatchingUpdateListener =
            isBatchingUpdate => !isBatchingUpdate && loadTree()
        BatchingUpdateManager.subscribe(batchingUpdateListener)

        // reloads bookmarkTree when user changes any bookmarks
        browser.bookmarks.onCreated.addListener(loadTree)
        browser.bookmarks.onChanged.addListener(loadTree)
        browser.bookmarks.onRemoved.addListener(loadTree)
        browser.bookmarks.onMoved.addListener(loadTree)

        const hashChangeListener = () => syncStateFromHashParams()
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

    useEffect(() => {
        if (bookmarkTree) {
            syncStateFromHashParams()
        }
    }, [bookmarkTree])
}
