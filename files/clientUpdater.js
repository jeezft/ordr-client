const path = require("path")
const wget = require("wget-improved")
const fs = require("fs")
const unzipper = require("unzipper")
const log = require('./logger')

module.exports = async () => {
    var link = `https://dl.issou.best/ordr/client-latest.zip`
    const output = path.resolve("files/client-latest.zip")

    let download = wget.download(link, output)
    download.on("error", err => {
        log.error(err)
        process.exit()
    })
    download.on("start", fileSize => {
        log.info(`Downloading the client update at ${link}, ${fileSize} bytes to download...`)
    })
    download.on("end", () => {
        try {
            fs.createReadStream(output)
                .pipe(
                    unzipper.Extract({
                        path: `.`
                    })
                )
                .on("close", () => {
                    log.done(`Finished updating the client. You can now restart it.`)
                    process.exit()
                })
        } catch (err) {
            log.error("An error occured while unpacking: " + err)
            process.exit(1)
        }
    })
}
