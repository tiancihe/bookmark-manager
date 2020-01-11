const path = require("path")

const { DefinePlugin, HotModuleReplacementPlugin } = require("webpack")

const config = {
    entry: {
        background: path.join(__dirname, "src/background/index.ts"),
        ui: path.join(__dirname, "src/ui/index.tsx")
    },
    output: {
        path: path.join(__dirname, "package/scripts"),
        filename: "[name].js"
    },
    mode: "production",
    stats: "minimal",
    devServer: {
        hot: false,
        inline: false,
        writeToDisk: true
    },
    performance: {
        hints: false
    },
    optimization: {
        minimize: false
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "babel-loader"
                    }
                ]
            }
        ]
    },
    plugins: [
        new DefinePlugin({
            __DEV__: true
        }),
        new HotModuleReplacementPlugin()
    ]
}

module.exports = config
