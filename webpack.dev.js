const path = require("path")

const webpack = require("webpack")
const HTMLWebpackPlugin = require("html-webpack-plugin")

module.exports = {
    entry: {
        background: path.join(__dirname, "src/background/index.ts"),
        ui: path.join(__dirname, "src/ui/index.tsx")
    },
    output: {
        path: path.join(__dirname, "package"),
        filename: "[name].bundle.js"
    },
    mode: "development",
    resolve: {
        extensions: [".js", ".ts", ".tsx", ".css"],
        alias: {
            "react-dom": "@hot-loader/react-dom"
        }
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
            __DEV__: true
        }),
        new webpack.HotModuleReplacementPlugin(),
        new HTMLWebpackPlugin()
    ]
}
