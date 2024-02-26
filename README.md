# Bookmark Manager

A bookmark manager extension for browsers.

## Features

- Quick open with `Ctrl + Alt + B` ( `Command + Control + B` on mac )
- Quick search with `Ctrl + F` ( `Command + F` on mac ), then use arrow keys to navigate through search results, `Enter` key ( or double click ) to quickly open a bookmark or folder, press `ESC` key will clear the search input
- Hold `Ctrl` ( `Command` on mac ) to select multiple items, hold `Shift` to select all items in between
- Copy, paste and cut with `Ctrl + C` ( `Command + C` on mac ), `Ctrl + V` ( `Command + V` on mac ), `Ctrl + X` ( `Command + X` on mac ), copy or cut bookmarks will also copy their urls to clipboard
- Undo and redo with `Ctrl + Z` ( `Command + Z` on mac ), `Ctrl + Shift + Z` ( `Command + Shift + Z` on mac ), note that action history is not kept between sessions, meaning when you close the bookmark page, all action history are cleared
- Delete bookmarks/folders via `Delete`
- Drag and drop selected items
- Sort bookmarks by name, url, date
- Hash history sync (meaning you can go forward and backward like web pages)
- Supports dark mode
- Settings are kept locally, such as theme setting (light / dark)
- Find duplicated bookmarks

## Build Instructions for Firefox

1. make sure nodejs is installed

   ```bash
   # use nvm to manage nodejs versions
   # https://github.com/nvm-sh/nvm
   nvm install 18
   nvm use 18
   ```

2. install dependencies

   ```bash
   # this project is using pnpm as its package manager, to install it, run
   npm i -g pnpm
   # install dependencies using pnpm
   pnpm i
   ```

3. run `pnpm run pack:firefox` to build the extension into `web-ext-artifacts` folder

## Development

1. run `pnpm run dev` to start dev server

2. load the extension in your firefox desktop browser

   1. visit `about:debugging#/runtime/this-firefox` and click `Load Temporary Add-on...` button

   2. select the `manifest.json` file under the `firefox` folder

3. load the extension in your chrome desktop browser

   1. visit `chrome://extensions` and click `Load unpacked` button

   2. select the `chrome` folder
