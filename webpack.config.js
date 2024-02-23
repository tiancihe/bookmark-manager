const path = require("path")
const { DefinePlugin } = require("webpack")

const isDev = process.env.NODE_ENV === "development"
const buildTarget = process.env.BUILD_TARGET

/** @type {import('webpack').Configuration} */
const commonConfig = {
    entry: {
        background: path.join(__dirname, "src/background/index.ts"),
        ui: path.join(__dirname, "src/ui/index.tsx"),
    },
    output: {
        clean: true,
        filename: "[name].js",
    },
    mode: isDev ? "development" : "production",
    watch: isDev,
    stats: isDev ? "minimal" : undefined,
    devtool: isDev ? "inline-source-map" : false,
    performance: {
        hints: false,
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/i,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            compact: false,
                            presets: [
                                "@babel/preset-env",
                                [
                                    "@babel/preset-react",
                                    {
                                        runtime: "automatic",
                                    },
                                ],
                                "@babel/preset-typescript",
                            ],
                            plugins: [
                                [
                                    "babel-plugin-import",
                                    {
                                        libraryName: "@mui/material",
                                        libraryDirectory: "",
                                        camel2DashComponentName: false,
                                    },
                                    "core",
                                ],
                                [
                                    "babel-plugin-import",
                                    {
                                        libraryName: "@mui/icons-material",
                                        libraryDirectory: "",
                                        camel2DashComponentName: false,
                                    },
                                    "icons",
                                ],
                            ],
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
}

/** @type {import('webpack').Configuration} */
const firefoxConfig = {
    ...commonConfig,
    output: {
        ...commonConfig.output,
        path: path.join(__dirname, "package/assets"),
    },
    plugins: [
        new DefinePlugin({
            __DEV__: isDev,
            __CHROME__: false,
        }),
    ],
}

/** @type {import('webpack').Configuration} */
const chromeConfig = {
    ...commonConfig,
    output: {
        ...commonConfig.output,
        path: path.join(__dirname, "chrome/assets"),
    },
    plugins: [
        new DefinePlugin({
            __DEV__: isDev,
            __CHROME__: true,
        }),
    ],
}

module.exports =
    buildTarget === "firefox" ? firefoxConfig : buildTarget === "chrome" ? chromeConfig : [firefoxConfig, chromeConfig]
