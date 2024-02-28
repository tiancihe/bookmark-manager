import { Divider } from "@mui/material"
import { useEffect, useRef, useState } from "react"

import { setSettings, useStore } from "../store"
import { __FOLDER_PANEL_ID__ } from "../consts"

export default function Splitter() {
    const settings = useStore(s => s.settings)

    const [isVisible, setIsVisible] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const startPosRef = useRef(-1)

    useEffect(() => {
        if (isDragging) {
            const onMouseMove = (e: MouseEvent) => {
                if (!isDragging) return
                const folderPanel = document.getElementById(__FOLDER_PANEL_ID__)
                if (folderPanel) {
                    folderPanel.style.width = `${Math.max(
                        Math.min(
                            settings.splitterPosition +
                                (e.clientX - startPosRef.current),
                            400,
                        ),
                        256,
                    )}px`
                }
            }
            const onMouseUp = (e: MouseEvent) => {
                setSettings({
                    splitterPosition: Math.max(
                        Math.min(
                            settings.splitterPosition +
                                (e.clientX - startPosRef.current),
                            400,
                        ),
                        256,
                    ),
                })
                startPosRef.current = -1
                setIsDragging(false)
                setIsVisible(false)
            }
            window.addEventListener("mousemove", onMouseMove)
            window.addEventListener("mouseup", onMouseUp)
            return () => {
                window.removeEventListener("mousemove", onMouseMove)
                window.removeEventListener("mouseup", onMouseUp)
            }
        }
    }, [settings, setSettings, isDragging])

    return (
        <Divider
            orientation="vertical"
            sx={{
                opacity: isVisible ? 1 : 0,
                marginTop: theme => theme.spacing(1),
                width: theme => theme.spacing(2),
                height: theme => `calc(100% - ${theme.spacing(2)})`,
                userSelect: "none",
                cursor: "move",
            }}
            draggable={false}
            onMouseEnter={() => {
                setIsVisible(true)
            }}
            onMouseLeave={() => {
                if (isDragging) return
                setIsVisible(false)
            }}
            onMouseDown={e => {
                startPosRef.current = e.clientX
                setIsDragging(true)
            }}
        />
    )
}
