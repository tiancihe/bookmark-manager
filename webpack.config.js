const path = require("path")

const { DefinePlugin } = require("webpack")

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
    performance: {
        hints: false
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
            __DEV__: false
        })
    ]
}

module.exports = config
