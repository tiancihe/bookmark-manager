import { useState } from "react"
import { MenuProps } from "@mui/material"

export default function useContextMenu() {
    const [mousePosition, setMousePosition] = useState<{
        x: number
        y: number
    } | null>(null)

    return {
        contextMenuProps: {
            anchorReference: "anchorPosition",
            anchorPosition: mousePosition
                ? {
                      left: mousePosition.x,
                      top: mousePosition.y,
                  }
                : undefined,
            open: !!mousePosition,
            onClose: () => {
                setMousePosition(null)
            },
        } as Pick<MenuProps, "anchorReference" | "anchorPosition" | "open" | "onClose">,
        handleContextMenuEvent: (e: React.MouseEvent) => {
            e.preventDefault()
            setMousePosition({
                x: e.clientX - 2,
                y: e.clientY - 4,
            })
        },
        closeContextMenu: () => {
            setMousePosition(null)
        },
    }
}
