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
        filename: "[name].js",
        chunkFilename: "[name].js"
    },
    mode: "production",
    resolve: {
        extensions: [".js", ".ts", ".tsx", ".css"]
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                use: ["babel-loader"]
            }
        ]
    },
    optimization: {
        splitChunks: {
            chunks: "all",
            automaticNameDelimiter: ".",
            name: true
        },
        namedChunks: true
    },
    plugins: [
        new webpack.DefinePlugin({
            __DEV__
        })
    ]
}

module.exports = config
