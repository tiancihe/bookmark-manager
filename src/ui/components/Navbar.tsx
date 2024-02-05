import { useState, useEffect, useRef, createRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
    AppBar,
    Toolbar,
    Typography,
    InputBase,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    FormControlLabel,
    Switch,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import { Search, Clear, Brightness4, Brightness5, MoreVert } from "@mui/icons-material"

import useSettings from "../hooks/useSettings"
import { selectNode } from "../store/dnd"
import { setHashParam, sortFolderByName, sortFolderByUrl } from "../utils"
import { RootState } from "../types"
import { __MAC__ } from "../consts"

const useNavbarStyle = makeStyles(theme => ({
    appBar: {
        backgroundColor: theme.palette.type === "dark" ? theme.palette.background.default : undefined,
    },
    toolbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        cursor: "pointer",
    },
    searchContainer: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        maxWidth: "50%",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        "&:hover": {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
    },
    searchIconContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: theme.spacing(5),
        cursor: "pointer",
    },
    clearIconContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: theme.spacing(5),
        cursor: "pointer",
    },
    inputRoot: {
        flex: 1,
        color: "inherit",
    },
    inputInput: {
        padding: theme.spacing(1),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "200px",
        },
    },
}))

export default function Navbar() {
    const activeFolder = useSelector((state: RootState) => state.bookmark.activeFolder)
    const search = useSelector((state: RootState) => state.bookmark.search)
    const searchResult = useSelector((state: RootState) => state.bookmark.searchResult)
    const dispatch = useDispatch()

    const [input, setInput] = useState(search)
    const inputRef = useRef(createRef<HTMLInputElement>())
    // sync input with global search state
    useEffect(() => {
        if (input !== search) {
            setInput(search)
        }
    }, [search])
    useEffect(() => {
        // capture search hotkey to focus on input
        const focus = (e: KeyboardEvent) => {
            if (e.target === document.body && e.key === "f" && ((!__MAC__ && e.ctrlKey) || (__MAC__ && e.metaKey))) {
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

    // used autofocus attribute on the input element
    const [isInputFocused, setIsInputFocused] = useState(true)

    useEffect(() => {
        if (inputRef.current.current) {
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

    // captures ArrowDown key to move focus to BookmarkPanel
    // where you can use up and down arrow keys to move through bookmarks and folders
    useEffect(() => {
        if (inputRef.current.current && isInputFocused) {
            const input = inputRef.current.current
            const listener = (e: KeyboardEvent) => {
                if (e.key === "ArrowDown") {
                    input.blur()
                    if (searchResult.length) {
                        dispatch(selectNode(searchResult[0]))
                    }
                }
            }
            input.addEventListener("keydown", listener)
            return () => input.removeEventListener("keydown", listener)
        }
    }, [inputRef.current, isInputFocused, searchResult])

    const { settings, setSettings } = useSettings()

    const [actionMenuAndhor, setActionMenuAnchor] = useState<null | HTMLElement>(null)
    const closeActionMenu = () => setActionMenuAnchor(null)

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
                            input: classNames.inputInput,
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
                <div>
                    <IconButton
                        color="inherit"
                        onClick={e => {
                            e.stopPropagation()
                            setSettings({ ...settings!, darkMode: !settings?.darkMode })
                        }}
                    >
                        {settings?.darkMode ? <Brightness5 /> : <Brightness4 />}
                    </IconButton>
                    <IconButton color="inherit" onClick={e => setActionMenuAnchor(e.currentTarget)}>
                        <MoreVert />
                    </IconButton>
                </div>
                <Menu open={!!actionMenuAndhor} anchorEl={actionMenuAndhor} onClose={closeActionMenu}>
                    <MenuItem
                        onClick={e => {
                            e.stopPropagation()
                            closeActionMenu()
                            if (!search && activeFolder) {
                                sortFolderByName(activeFolder)
                            }
                        }}
                    >
                        Sort by name
                    </MenuItem>
                    <MenuItem
                        onClick={e => {
                            e.stopPropagation()
                            closeActionMenu()
                            if (!search && activeFolder) {
                                sortFolderByUrl(activeFolder)
                            }
                        }}
                    >
                        Sort by URL
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        <FormControlLabel
                            control={
                                <Switch
                                    color="primary"
                                    checked={settings?.disableFavicon}
                                    onChange={(_, checked) => setSettings({ ...settings!, disableFavicon: checked })}
                                />
                            }
                            label="Disable favicon"
                        />
                    </MenuItem>
                    <MenuItem>
                        <FormControlLabel
                            control={
                                <Switch
                                    color="primary"
                                    checked={settings?.alwaysShowURL}
                                    onChange={(_, checked) => setSettings({ ...settings!, alwaysShowURL: checked })}
                                />
                            }
                            label="Always show URL"
                        />
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    )
}
