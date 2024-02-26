const cp = require("child_process")

const { version } = require("../package.json")

const buildTarget = process.env.BUILD_TARGET

async function start() {
    try {
        cp.execSync(`npm run build${buildTarget ? `:${buildTarget}` : ""}`, { stdio: process.stdio })
        if (buildTarget) {
            cp.execSync(`web-ext build -s ${buildTarget} -o -n bookmark-manager-${buildTarget}-${version}.zip`, {
                stdio: process.stdio,
            })
        } else {
            cp.execSync(`web-ext build -s firefox -o -n bookmark-manager-firefox-${version}.zip`, {
                stdio: process.stdio,
            })
            cp.execSync(`web-ext build -s chrome -o -n bookmark-manager-chrome-${version}.zip`, {
                stdio: process.stdio,
            })
        }
        cp.execSync(
            `git archive master --format zip --output web-ext-artifacts/bookmark-manager-${version}-source.zip`,
            { stdio: process.stdio },
        )
    } catch (err) {
        console.log(err)
    }
}
start()
