const { DefinePlugin, HotModuleReplacementPlugin } = require("webpack")

const common = require("./webpack.common")

const config = {
    ...common,
    stats: "minimal",
    devServer: {
        hot: true,
        inline: false,
        writeToDisk: true
    },
    optimization: {
        minimize: false
    },
    plugins: [
        new DefinePlugin({
            __DEV__: true
        }),
        new HotModuleReplacementPlugin()
    ]
}

module.exports = config
