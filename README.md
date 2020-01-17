# Bookmark Manager

A bookmark manager extension for firefox.

First, install dependencies (make sure nodejs is installed)

```bash
npm install
```

## Development

1. start webpack-dev-server

   ```bash
     npm start
   ```

1. run the extension (make sure your default browser is firefox)

   ```bash
     npm run ext
   ```

## Production

The following command will pack the extension into a zip file under `web-ext-artifacts`.

```bash
npm run pack
```
