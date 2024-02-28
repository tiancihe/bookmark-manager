import { useEffect } from "react"

import { __MAC__ } from "../consts"
import { bookmarkActionHistory } from "../utils/bookmark"

export const useUndoRedo = () => {
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (
                (__MAC__ &&
                    e.key === "z" &&
                    e.metaKey &&
                    !e.shiftKey &&
                    !e.ctrlKey) ||
                (!__MAC__ &&
                    e.key === "z" &&
                    e.ctrlKey &&
                    !e.shiftKey &&
                    !e.altKey)
            ) {
                bookmarkActionHistory.undo()
                return
            }

            if (
                (__MAC__ &&
                    e.key === "z" &&
                    e.metaKey &&
                    e.shiftKey &&
                    !e.ctrlKey) ||
                (!__MAC__ &&
                    e.key === "z" &&
                    e.ctrlKey &&
                    e.shiftKey &&
                    !e.altKey)
            ) {
                bookmarkActionHistory.redo()
                return
            }
        }
        window.addEventListener("keydown", listener)
        return () => {
            window.removeEventListener("keydown", listener)
        }
    }, [])
}
