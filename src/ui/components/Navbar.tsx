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
import { Search, Clear, Brightness4, Brightness5 } from "@material-ui/icons"

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
    searchContainer: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        maxWidth: "50%",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        "&:hover": {
            backgroundColor: fade(theme.palette.common.white, 0.25)
        }
    },
    searchIconContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: theme.spacing(5),
        cursor: "pointer"
    },
    clearIconContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: theme.spacing(5),
        cursor: "pointer"
    },
    inputRoot: {
        flex: 1,
        color: "inherit"
    },
    inputInput: {
        padding: theme.spacing(1),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "200px"
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
                <div className={classNames.searchContainer}>
                    <div className={classNames.searchIconContainer}>
                        <Search
                            onClick={e => {
                                e.stopPropagation()
                                dispatch(searchBookmark(input))
                            }}
                        />
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
                    {search ? (
                        <div className={classNames.clearIconContainer}>
                            <Clear
                                onClick={e => {
                                    e.stopPropagation()
                                    dispatch(searchBookmark(""))
                                }}
                            />
                        </div>
                    ) : null}
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
