import React from "react"
import { Card, CardHeader, CardContent } from "@material-ui/core"

import { BookmarkTreeNode } from "../../types"

const BookmarkCard: React.FC<{ bookmarkNode: BookmarkTreeNode }> = ({
    bookmarkNode
}) => {
    return (
        <Card>
            <CardHeader title={bookmarkNode.title} />
            <CardContent>{bookmarkNode.url}</CardContent>
        </Card>
    )
}

export default BookmarkCard
