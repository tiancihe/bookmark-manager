const path = require("path")
const { DllPlugin } = require("webpack")

module.exports = {
    entry: {
        vendors: [
            "@material-ui/core",
            "@material-ui/icons",
            "@reduxjs/toolkit",
            "copy-to-clipboard",
            "lodash",
            "query-string",
            "react",
            "react-dnd",
            "react-dnd-html5-backend",
            "react-dom",
            "react-redux",
            "redux",
            "redux-thunk"
        ]
    },
    output: {
        filename: "[name].dll.js",
        path: path.join(__dirname, "package/scripts"),
        library: "vendors_dll"
    },
    mode: "production",
    performance: {
        hints: false
    },
    plugins: [
        new DllPlugin({
            name: "vendors_dll",
            path: path.join(
                __dirname,
                "package/scripts/vendors-dll-manifest.json"
            )
        })
    ]
}
