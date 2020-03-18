const cp = require("child_process")

const { version } = require("../package.json")

try {
    cp.execSync(
        `git archive master --format zip --output web-ext-artifacts/bookmark_manager-${version}-source.zip`
    )
    console.log("zip source code succeeded")
} catch (err) {
    console.log("zip source code failed:")
    console.log(err.message)
}
