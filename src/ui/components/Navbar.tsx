import { useState, useEffect, useRef, createRef } from "react"
import { styled } from "@mui/material/styles"
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
    Link,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import {
    Search,
    Clear,
    Brightness4,
    Brightness5,
    MoreVert,
} from "@mui/icons-material"

import { setHashParam } from "../utils/hashParams"
import {
    sortFolderByDateAsc,
    sortFolderByDateDesc,
    sortFolderByName,
    sortFolderByUrl,
} from "../utils/bookmark"
import { BookmarkNodeType } from "../types"
import { __MAC__ } from "../consts"
import {
    openBookmarkCreateModal,
    setSelectedBookmarkNodes,
    setSettings,
    useStore,
} from "../store"

const PREFIX = "Navbar"

const classes = {
    appBar: `${PREFIX}-appBar`,
    toolbar: `${PREFIX}-toolbar`,
    title: `${PREFIX}-title`,
    searchContainer: `${PREFIX}-searchContainer`,
    searchIconContainer: `${PREFIX}-searchIconContainer`,
    clearIconContainer: `${PREFIX}-clearIconContainer`,
    inputRoot: `${PREFIX}-inputRoot`,
    inputInput: `${PREFIX}-inputInput`,
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    [`& .${classes.appBar}`]: {
        backgroundColor:
            theme.palette.mode === "dark"
                ? theme.palette.background.default
                : undefined,
    },

    [`& .${classes.toolbar}`]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },

    [`& .${classes.title}`]: {
        cursor: "pointer",
    },

    [`& .${classes.searchContainer}`]: {
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

    [`& .${classes.searchIconContainer}`]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: theme.spacing(5),
        cursor: "pointer",
    },

    [`& .${classes.clearIconContainer}`]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: theme.spacing(5),
        cursor: "pointer",
    },

    [`& .${classes.inputRoot}`]: {
        flex: 1,
        color: "inherit",
    },

    [`& .${classes.inputInput}`]: {
        padding: theme.spacing(1),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "200px",
        },
    },
}))

export default function Navbar() {
    const activeFolder = useStore(state => state.activeFolder)
    const search = useStore(state => state.search)
    const searchResult = useStore(state => state.searchResult)

    const [input, setInput] = useState(search)
    const inputRef = useRef(createRef<HTMLInputElement>())
    // sync input with global search state
    useEffect(() => {
        setInput(search)
    }, [search])
    useEffect(() => {
        // capture search hotkey to focus on input
        const focus = (e: KeyboardEvent) => {
            if (
                e.target === document.body &&
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
                        setSelectedBookmarkNodes([searchResult[0]])
                    }
                }
            }
            input.addEventListener("keydown", listener)
            return () => input.removeEventListener("keydown", listener)
        }
    }, [inputRef.current, isInputFocused, searchResult])

    const settings = useStore(state => state.settings)

    const [actionMenuAnchor, setActionMenuAnchor] =
        useState<null | HTMLElement>(null)
    const closeActionMenu = () => setActionMenuAnchor(null)

    return (
        <StyledAppBar className={classes.appBar} position="static">
            <Toolbar className={classes.toolbar}>
                <Typography
                    className={classes.title}
                    onClick={e => {
                        e.stopPropagation()
                        setHashParam({
                            search: undefined,
                            folder: undefined,
                            dedupe: undefined,
                        })
                    }}
                >
                    Bookmarks
                </Typography>
                <div className={classes.searchContainer}>
                    <div className={classes.searchIconContainer}>
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
                            root: classes.inputRoot,
                            input: classes.inputInput,
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
                        <div className={classes.clearIconContainer}>
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
                            setSettings({ darkMode: !settings?.darkMode })
                        }}
                    >
                        {settings?.darkMode ? <Brightness5 /> : <Brightness4 />}
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={e => setActionMenuAnchor(e.currentTarget)}
                    >
                        <MoreVert />
                    </IconButton>
                </div>
                <Menu
                    open={!!actionMenuAnchor}
                    anchorEl={actionMenuAnchor}
                    onClose={closeActionMenu}
                >
                    <MenuItem
                        disabled={!!search || !activeFolder}
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
                        disabled={!!search || !activeFolder}
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
                    <MenuItem
                        disabled={!!search || !activeFolder}
                        onClick={e => {
                            e.stopPropagation()
                            closeActionMenu()
                            if (!search && activeFolder) {
                                sortFolderByDateDesc(activeFolder)
                            }
                        }}
                    >
                        Sort by date added (oldest first)
                    </MenuItem>
                    <MenuItem
                        disabled={!!search || !activeFolder}
                        onClick={e => {
                            e.stopPropagation()
                            closeActionMenu()
                            if (!search && activeFolder) {
                                sortFolderByDateAsc(activeFolder)
                            }
                        }}
                    >
                        Sort by date added (newest first)
                    </MenuItem>
                    <Divider />
                    <MenuItem
                        disabled={!!search || !activeFolder}
                        onClick={() => {
                            openBookmarkCreateModal(BookmarkNodeType.Bookmark)
                            closeActionMenu()
                        }}
                    >
                        Add new bookmark
                    </MenuItem>
                    <MenuItem
                        disabled={!!search || !activeFolder}
                        onClick={() => {
                            openBookmarkCreateModal(BookmarkNodeType.Folder)
                            closeActionMenu()
                        }}
                    >
                        Add new folder
                    </MenuItem>
                    <Divider />
                    <MenuItem
                        onClick={() => {
                            closeActionMenu()
                            setHashParam({
                                folder: undefined,
                                search: undefined,
                                dedupe: "1",
                            })
                        }}
                    >
                        Find duplicated bookmarks
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        <FormControlLabel
                            control={
                                <Switch
                                    color="primary"
                                    checked={settings?.disableFavicon}
                                    onChange={(_, checked) =>
                                        setSettings({ disableFavicon: checked })
                                    }
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
                                    onChange={(_, checked) =>
                                        setSettings({ alwaysShowURL: checked })
                                    }
                                />
                            }
                            label="Always show URL"
                        />
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        <Link
                            href="https://paypal.me/tiancihe95"
                            target="_blank"
                            underline="none"
                        >
                            Support me on paypal
                        </Link>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </StyledAppBar>
    )
}
