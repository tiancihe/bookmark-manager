## 0.8.0 (2020/5/15)

- major refactoring, great performance improvement, say goodbye to jaggy drag and drop
- fixed a bug where dropping multiple items do not behave as expected

## 0.7.3 (2020/5/8)

- when using arrow up and down keys to select items will scroll the panel and make the item display at center
- fixed a bug when using arrow down key to select the last node crashes

## 0.7.2 (2020/5/4)

- add arrow keys and enter key support for the search input and main panel
  - when focused in search input, press down arrow key to quickly select the first search result
  - use enter key to quickly open a bookmark or folder

## 0.7.1 (2020/4/27)

- add drag and drop support for the folder panel on the left

## 0.7.0 (2020/4/26)

- add copy and paste context menu items
- add experimental sort functionality
- add bookmarks count in context menu
- adjust copy behaviour
  - folders: title
  - bookmarks: url with title as an alternative if url is not present
- adjust open all bookmarks behaviour
  - bookmarks in subfolders will also be opened

## 0.6.4 (2020/4/26)

- add context menu for folders on the left panel

## 0.6.3 (2020/4/13)

- middle mouse button click a bookmark will open a new tab in background
- open all will open selected bookmarks in background by default

## 0.6.2 (2020/3/20)

- using hotkey CTRL + ALT + B (CTRL + COMMAND + B on Mac) will now correctly activate existing tab then fall back to create a new one

## 0.6.1 (2020/3/18)

- change extension name
- minor performance patch

## 0.6.0 (2020/2/14)

- copy and paste bookmarks
- hotkeys support
- context menu works for multiple selections
- bug fixes

## 0.5.1 (2020/2/3)

- sync search and current folder with url in real time

## 0.5.0 (2020/1/31)

- improve drag and drop performance
- add clear icon to clear search state
- clicks search icon now triggers search action

### bug fixes

- correctly show active folder
- immediately display folder according to user action (clear search state)
- clicks search input does not unselect current selected nodes

## 0.4.3 (2020/1/30)

- small performance boost

## 0.4.2 (2020/1/29)

- `getFavicon` only resolves domain

## 0.4.1 (2020/1/29)

- doc `getFavicon` util function

## 0.4.0 (2020/1/29)

- items are now selectable (also support multiple select)
- items now display its url (if any) when selected
- open action menu by right click
- add Open in new tab and Open in new window
- hotkey support
- better search

### bug fixes

- unintentional double click

## 0.3.2 (2020/1/17)

- map activeFolderId and search to location.hash
- update some deps

## v0.3.1 (2020/1/13)

- fix search input not focused after click

## v0.3.0 (2020/1/11)

### features

- drag and drop to move bookmarks and folders 🔥
- button to switch between light mode ☀ and dark mode 🌙

### fixes

- larger seach input

## v0.2.3 (2020/1/11)

- icons & title

## v0.2.2 (2019/12/26)

- add dark mode support (based on media query)

## v0.2.1 (2019/12/25)

- add default shortcut
- autofocus for search

## v0.2.0 (2019/12/18)

- refactor store
- fix seach results update issue
- fix edit modal not closed after edited issue
- add subfolder item double click feature
- add empty search results placeholder
- create modal now shows a help message if create option failed
- search now triggers on empty seach input
