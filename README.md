# Bookmark Manager

A bookmark manager extension for browsers.

## Features

- Quick open with `Ctrl + Shift + B` ( `Command + Control + B` on mac )
- Quick search with `Ctrl + F` ( `Command + F` on mac ), then use arrow keys to navigate through search results, `Enter` key ( or double click ) to quickly open a bookmark or folder, press `ESC` key will clear the search input
- Hold `Ctrl` ( `Command` on mac ) to select multiple items, hold `Shift` to select all items in between
- Copy, paste and cut with `Ctrl + C` ( `Command + C` on mac ), `Ctrl + V` ( `Command + V` on mac ), `Ctrl + X` ( `Command + X` on mac ), copy or cut bookmarks will also copy their urls to clipboard
- Undo and redo with `Ctrl + Z` ( `Command + Z` on mac ), `Ctrl + Shift + Z` ( `Command + Shift + Z` on mac ), note that action history is not kept between sessions, meaning when you close the bookmark page, all action history are cleared
- Delete bookmarks/folders via `Delete`
- Drag and drop selected items
- Sort bookmarks by URL/name
- Hash history sync (meaning you can go forward and backward like web pages)
- Supports dark mode
- Settings are kept locally, such as theme setting (light / dark)

### TODO

- i18n

## Development

1. First, install dependencies (make sure nodejs is installed)

   ```bash
   pnpm i
   ```

2. start dev server

   ```bash
   pnpm dev
   ```

3. load the extension inside the package folder in your firefox desktop browser

4. run `pnpm run pack` to pack the artifacts for AMO submission
