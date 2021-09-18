const path = require("path")
const wget = require("wget-improved")
const unzipper = require("unzipper")
const fs = require("fs")
const config = require(process.cwd() + "/config.json")
const { startServer } = require("./server")
const settingsGenerator = require("./settingsGenerator")
const log = require('./logger')

module.exports = async cb => {
    var link
    if (process.platform === "win32") {
        link = `https://dl.issou.best/ordr/danser-latest-win.zip`
    } else {
        link = `https://dl.issou.best/ordr/danser-latest-linux.zip`
    }
    const output = path.resolve("files/danser/danser.zip")
    let download = wget.download(link, output)
    download.on("error", err => {
        log.error(err)
    })
    download.on("start", fileSize => {
        log.info(`Downloading danser at ${link}: ${fileSize} bytes to download...`)
    })
    download.on("end", () => {
        try {
            fs.createReadStream(output)
                .pipe(
                    unzipper.Extract({
                        path: `files/danser`
                    })
                )
                .on("close", () => {
                    log.done(`Finished downloading danser.`)
                    if (config.id) {
                        startServer()
                    } else {
                        settingsGenerator("new")
                    }
                    if (process.platform === "linux") {
                        fs.chmodSync("files/danser/danser", "755")
                    }
                    if (cb) {
                        cb()
                    }
                })
        } catch (err) {
            log.error("An error occured while unpacking Danser: " + err)
            process.exit(1)
        }
    })
}
