# Bookmark Manager

A bookmark manager extension for firefox.

## Features

- Quick open with `Ctrl/Cmd + Alt + B`
- Quick search with `Ctrl/Cmd + F` (press `ESC` key will clear the search input), then use arrow keys to navigate through search results, enter key (or double click) to quickly open a bookmark or folder
- Hold `Ctrl/Cmd` to select another item, hold `Shift` to select items in between
- Copy and paste with `Ctrl/Cmd + C`, `Ctrl/Cmd + V`, copy bookmarks will also copy their urls to clipboard
- Delete bookmarks/folders via `Del/Cmd + Backspace`
- Drag and drop selected items
- Sort bookmarks by URL/name (located at top right corner)
- Hash history sync (meaning you can go forward and backward like web pages)
- Supports dark mode
- Settings are kept locally, including theme setting (light / dark)

### TODO

- i18n
- Resizable folder panel
- Undo previous actions
- Add support to cut items

## Development

1. First, install dependencies (make sure nodejs is installed)

   ```bash
   npm i
   ```

1. start webpack-dev-server

   ```bash
   npm start
   ```

1. run the extension (make sure your default browser is firefox)

   ```bash
   npm run ext
   ```

1. The following command will pack the extension into a zip file under `web-ext-artifacts` ready for production.

   ```bash
   npm run pack
   ```
