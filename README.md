# Bookmark Manager

WIP: A bookmark manager extension for firefox.

## Development

1. execute the following commands in your terminal (make sure nodejs is installed)

   ```bash
   npm install
   npm start
   ```

1. load temporary extension in firefox

   - use web-ext package

     ```bash
     npx web-ext run --source-dir package
     ```

   - load manually

     1. open a new tab in firefox
     1. go to `about:debugging#/runtime/this-firefox`
     1. click `Load Temorary Add-on`
