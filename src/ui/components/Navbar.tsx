import React from "react"
import { useSelector, useDispatch } from "react-redux"
import {
    makeStyles,
    fade,
    AppBar,
    Toolbar,
    Typography,
    InputBase,
    IconButton
} from "@material-ui/core"
import { Search, Brightness4, Brightness5 } from "@material-ui/icons"

import { searchBookmark } from "../store/bookmark"
import { toggleDarkMode } from "../store/setting"
import { RootState } from "../types"
import { __MAC__ } from "../consts"

const useNavbarStyle = makeStyles(theme => ({
    appBar: {
        backgroundColor:
            theme.palette.type === "dark"
                ? theme.palette.background.default
                : undefined
    },
    toolbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },
    search: {
        flex: 1,
        maxWidth: "50%",
        position: "relative",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        "&:hover": {
            backgroundColor: fade(theme.palette.common.white, 0.25)
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            marginLeft: theme.spacing(3),
            width: "auto"
        }
    },
    searchIcon: {
        width: theme.spacing(7),
        height: "100%",
        position: "absolute",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    inputRoot: {
        width: "100%",
        color: "inherit"
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 7),
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: 200
        }
    }
}))

const SEARCH_INPUT_ID = "SEARCH_INPUT"

export default function Navbar() {
    const search = useSelector((state: RootState) => state.bookmark.search)
    const darkMode = useSelector((state: RootState) => state.setting.darkMode)
    const dispatch = useDispatch()

    const [input, setInput] = React.useState(search)
    // sync input with global search state
    React.useEffect(() => {
        if (input !== search) {
            setInput(search)
        }
    }, [search])

    React.useEffect(() => {
        // capture search hotkey
        const focus = (e: KeyboardEvent) => {
            if (
                e.key === "f" &&
                ((!__MAC__ && e.ctrlKey) || (__MAC__ && e.metaKey))
            ) {
                e.preventDefault()
                const input = document.getElementById(
                    SEARCH_INPUT_ID
                ) as HTMLInputElement
                input.focus()
            }
        }
        window.addEventListener("keydown", focus)
        return () => window.removeEventListener("keydown", focus)
    }, [])

    const classNames = useNavbarStyle()

    return (
        <AppBar className={classNames.appBar} position="static">
            <Toolbar className={classNames.toolbar}>
                <Typography>Bookmarks</Typography>
                <div className={classNames.search}>
                    <div className={classNames.searchIcon}>
                        <Search />
                    </div>
                    <InputBase
                        autoFocus
                        id={SEARCH_INPUT_ID}
                        placeholder="Search here"
                        classes={{
                            root: classNames.inputRoot,
                            input: classNames.inputInput
                        }}
                        value={input}
                        onClick={e => {
                            e.stopPropagation()
                        }}
                        onChange={e => {
                            e.stopPropagation()
                            setInput(e.target.value)
                        }}
                        onKeyDown={e => {
                            e.stopPropagation()
                            if (e.key === "Enter") {
                                dispatch(searchBookmark(input))
                            }
                        }}
                    />
                </div>
                <IconButton
                    color="inherit"
                    onClick={e => {
                        e.stopPropagation()
                        dispatch(toggleDarkMode())
                    }}
                >
                    {darkMode ? <Brightness5 /> : <Brightness4 />}
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}
