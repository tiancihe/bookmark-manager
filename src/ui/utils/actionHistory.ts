export type Action<T = unknown> = {
    info?: T
    do: () => void
    undo: () => void
}

export function createActionHistory<T>() {
    const undoStack: Action<T>[] = []
    const redoStack: Action<T>[] = []

    const record = (action: Action<T>) => {
        undoStack.push(action)
    }

    const undo = () => {
        const action = undoStack.pop()
        if (action) {
            redoStack.push(action)
            action.undo()
        }
    }

    const redo = () => {
        const action = redoStack.pop()
        if (action) {
            undoStack.push(action)
            action.do()
        }
    }

    return {
        undoStack,
        redoStack,
        record,
        redo,
        undo,
    }
}
