const { DefinePlugin } = require("webpack")

const common = require("./webpack.common")

const config = {
    ...common,
    plugins: [
        new DefinePlugin({
            __DEV__: false
        })
    ]
}

module.exports = config
