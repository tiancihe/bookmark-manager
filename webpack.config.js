const path = require("path")
const { DefinePlugin } = require("webpack")

const isDev = process.env.NODE_ENV === "development"

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
                test: /\.(j|t)sx?$/,
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
                        },
                    },
                ],
            },
        ],
    },
}

/** @type {import('webpack').Configuration} */
const firefoxConfig = {
    ...commonConfig,
    output: {
        ...commonConfig.output,
        path: path.join(__dirname, "package/scripts"),
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
        path: path.join(__dirname, "chrome/scripts"),
    },
    plugins: [
        new DefinePlugin({
            __DEV__: isDev,
            __CHROME__: true,
        }),
    ],
}

module.exports = [firefoxConfig, chromeConfig]
