import React from "react"
import { AppBar, Toolbar, Typography } from "@material-ui/core"

const Navbar: React.FC = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography>Bookmark Manager</Typography>
            </Toolbar>
        </AppBar>
    )
}

export default Navbar
