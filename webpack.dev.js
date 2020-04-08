const path = require("path")
const {
    DefinePlugin,
    DllReferencePlugin,
    HotModuleReplacementPlugin
} = require("webpack")

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
        new DllReferencePlugin({
            manifest: path.join(
                __dirname,
                "package/scripts/vendors-dll-manifest.json"
            )
        }),
        new HotModuleReplacementPlugin()
    ]
}

module.exports = config
