const path = require("path")

const webpack = require("webpack")
const HTMLWebpackPlugin = require("html-webpack-plugin")

const { NODE_ENV, DEV_ENV } = process.env

const __DEV__ = NODE_ENV === "development"

const __BACKGROUND__ = DEV_ENV === "background"
const __UI__ = DEV_ENV === "ui"

const config = {
    entry: {
        background: path.join(__dirname, "src/background/index.ts"),
        ui: path.join(__dirname, "src/ui/index.tsx")
    },
    output: {
        path: path.join(__dirname, "package"),
        filename: "[name].bundle.js"
    },
    mode: NODE_ENV || "production",
    resolve: {
        extensions: [".js", ".ts", ".tsx", ".css"]
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                use: ["babel-loader"]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
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
    if (__BACKGROUND__) {
        config.entry = path.join(__dirname, "src/background/index.ts")
        config.output.filename = "background.bundle.js"
        config.watch = true
    }

    if (__UI__) {
        config.entry = path.join(__dirname, "src/ui/index.tsx")
        config.output.filename = "ui.bundle.js"
        config.devServer = {
            hot: true,
            progress: true
        }
        config.resolve.alias = {
            "react-dom": "@hot-loader/react-dom"
        }
        config.plugins.push(new webpack.HotModuleReplacementPlugin())
        config.plugins.push(new HTMLWebpackPlugin())
    }
}

module.exports = config
