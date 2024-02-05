export const DNDTypes = {
    BookmarkItem: "BookmarkItem",
    FolderItem: "FolderItem",
}

export const __MAC__ = /mac/i.test(navigator.userAgent)

export type BatchingUpdateListener = (isBatchingUpdate: boolean) => void

function createBatchingUpdateManager() {
    let state = {
        isBatchingUpdate: false,
    }
    let listeners = new Set<BatchingUpdateListener>()

    const subscribe = (listener: BatchingUpdateListener) => {
        listeners.add(listener)
    }

    const unsubscribe = (listener: BatchingUpdateListener) => {
        listeners.delete(listener)
    }

    const beginBatchingUpdate = () => {
        state.isBatchingUpdate = true
        listeners.forEach(l => l(true))
    }

    const endBatchingUpdate = () => {
        state.isBatchingUpdate = false
        listeners.forEach(l => l(false))
    }

    return {
        state,
        subscribe,
        unsubscribe,
        beginBatchingUpdate,
        endBatchingUpdate,
    }
}

export const BatchingUpdateManager = createBatchingUpdateManager()
