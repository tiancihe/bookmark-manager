import React from "react"
import { useSelector, useDispatch } from "react-redux"
import {
    AppBar,
    Toolbar,
    Typography,
    InputBase,
    IconButton
} from "@material-ui/core"
import { makeStyles, fade } from "@material-ui/core/styles"
import { Search, Clear, Brightness4, Brightness5 } from "@material-ui/icons"

import { RootState } from "../types"
import { toggleDarkMode } from "../store/setting"
import { setHashParam } from "../utils"
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
    title: {
        cursor: "pointer"
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

export default function Navbar() {
    const search = useSelector((state: RootState) => state.bookmark.search)
    const darkMode = useSelector((state: RootState) => state.setting.darkMode)
    const dispatch = useDispatch()

    const [input, setInput] = React.useState(search)
    const inputRef = React.useRef(React.createRef<HTMLInputElement>())
    // sync input with global search state
    React.useEffect(() => {
        if (input !== search) {
            setInput(search)
        }
    }, [search])
    React.useEffect(() => {
        // capture search hotkey to focus on input
        const focus = (e: KeyboardEvent) => {
            if (
                e.key === "f" &&
                ((!__MAC__ && e.ctrlKey) || (__MAC__ && e.metaKey))
            ) {
                e.preventDefault()
                const input = inputRef.current.current
                if (input) {
                    input.focus()
                }
            }
        }
        window.addEventListener("keydown", focus)
        return () => window.removeEventListener("keydown", focus)
    }, [])

    const [isInputFocused, setIsInputFocused] = React.useState(false)
    React.useEffect(() => {
        if (inputRef.current && inputRef.current.current) {
            const input = inputRef.current.current

            const inputFocusListener = () => {
                setIsInputFocused(true)
            }
            input.addEventListener("focus", inputFocusListener)

            const inputBlurListener = () => {
                setIsInputFocused(false)
            }
            input.addEventListener("blur", inputBlurListener)

            const escapeKeyListener = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    if (isInputFocused && search) {
                        e.stopPropagation()
                        setHashParam({ search: undefined })
                    }
                }
            }
            input.addEventListener("keydown", escapeKeyListener)

            return () => {
                input.removeEventListener("focus", inputFocusListener)
                input.removeEventListener("blur", inputBlurListener)
                input.removeEventListener("keydown", escapeKeyListener)
            }
        }
    }, [inputRef.current, isInputFocused, search])

    const classNames = useNavbarStyle()

    return (
        <AppBar className={classNames.appBar} position="static">
            <Toolbar className={classNames.toolbar}>
                <Typography
                    className={classNames.title}
                    onClick={e => {
                        e.stopPropagation()
                        setHashParam({ search: undefined, folder: undefined })
                    }}
                >
                    Bookmarks
                </Typography>
                <div className={classNames.searchContainer}>
                    <div className={classNames.searchIconContainer}>
                        <Search
                            onClick={e => {
                                e.stopPropagation()
                                setHashParam({ search: input })
                            }}
                        />
                    </div>
                    <InputBase
                        autoFocus
                        placeholder="Search here"
                        classes={{
                            root: classNames.inputRoot,
                            input: classNames.inputInput
                        }}
                        inputRef={inputRef.current}
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
                                setHashParam({ search: input })
                            }
                        }}
                    />
                    {search ? (
                        <div className={classNames.clearIconContainer}>
                            <Clear
                                onClick={e => {
                                    e.stopPropagation()
                                    setHashParam({ search: undefined })
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
