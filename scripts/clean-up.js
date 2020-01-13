const fs = require("fs")
const path = require("path")

const folderPath = path.join(__dirname, "../package/scripts")

/**
 * @param {string} filename
 */
const resolveFilePath = filename => path.join(folderPath, filename)

/**
 * @param {string} filename
 */
const removeFile = filename => fs.unlinkSync(resolveFilePath(filename))

/**
 * clean up files under package/scripts folder for production
 */
const cleanUp = () => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
    }

    const files = fs.readdirSync(folderPath)
    if (files.length) {
        console.log("Cleaning up package/scripts/* ...")
        files.forEach(removeFile)
    }
}

cleanUp()
