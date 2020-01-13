const fs = require("fs")
const path = require("path")

const prettier = require("prettier")

const manifestFilePath = path.join(__dirname, "../package/manifest.json")

const packageFilePath = path.join(__dirname, "../package.json")

/**
 * update a json files version field
 * @param {string} filePath
 * @param {string} version
 */
const updateVersion = (filePath, version) => {
    const manifest = require(filePath)
    manifest.version = version
    fs.writeFileSync(
        filePath,
        prettier.format(JSON.stringify(manifest, null, 2), {
            parser: "json"
        })
    )
}

const update = () => {
    const version = process.argv[2]

    if (!version) {
        console.error(`Invalid version: ${version}`)
    }

    updateVersion(manifestFilePath, version)
    updateVersion(packageFilePath, version)
}

update()
