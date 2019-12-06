const path = require("path")

const webpack = require("webpack")

const { NODE_ENV } = process.env

const __DEV__ = NODE_ENV === "development"

const config = {
    entry: {
        background: path.join(__dirname, "src/background/index.ts"),
        ui: path.join(__dirname, "src/ui/index.tsx")
    },
    output: {
        path: path.join(__dirname, "package"),
        filename: "[name].js"
    },
    stats: "minimal",
    mode: "production",
    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ["ts-loader"]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            __DEV__
        })
    ]
}

if (__DEV__) {
    config.watch = true
    config.plugins.push(new webpack.ProgressPlugin())
}

module.exports = config
