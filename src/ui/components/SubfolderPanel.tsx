import React from "react"
import { makeStyles, styled, Paper } from "@material-ui/core"

import { useStore } from "../Store"
import BookmarkTreeItem from "./BookmarkTreeItem"

const useSubfolderPanelStyle = makeStyles({
    container: {
        padding: "24px 32px 24px 16px"
    }
})

const SPaper = styled(Paper)({
    width: "100%",
    padding: "8px 0"
})

const SubfolderPanel: React.FC = () => {
    const classNames = useSubfolderPanelStyle()

    const { activeFolder } = useStore()

    return (
        <div className={classNames.container}>
            {!activeFolder ||
            !activeFolder.children ||
            !activeFolder.children.length ? null : (
                <SPaper>
                    {activeFolder.children.map(child => (
                        <BookmarkTreeItem bookmarkNode={child} />
                    ))}
                </SPaper>
            )}
        </div>
    )
}

export default SubfolderPanel
