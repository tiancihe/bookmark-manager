const path = require("path")

module.exports = {
    entry: path.join(__dirname, "src/background/index.ts"),
    output: {
        path: path.join(__dirname, "package/background"),
        filename: "bundle.js"
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            }
        ]
    }
}