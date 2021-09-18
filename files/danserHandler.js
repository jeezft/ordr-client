const uploadVideo = require("./uploadVideo")
const log = require('./logger')
let isRendering = false

exports.startDanser = async (danserArguments, videoName) => {
    isRendering = true

    const config = require(process.cwd() + "/config.json")
    var spawn = require("child_process").spawn
    let danserPath
    if (process.platofrm === "win32") {
        danserPath = `${process.cwd()}/files/danser/danser.exe`
    } else {
        danserPath = `${process.cwd()}/files/danser/danser`
    }
    const danser = spawn(danserPath, danserArguments)
    const { sendProgression, reportPanic } = require("./server")

    danser.stdout.setEncoding("utf8")
    danser.stdout.on(`data`, data => {
        if (data.includes("Progress")) {
            if (!config.showFullDanserLogs) {
                log.info(data.replace(/\n/g, "").slice(20))
            }
            sendProgression(data)
        }
        if (data.includes("Finished.")) {
            log.done(`Rendering done.`)
            sendProgression("uploading")
            uploadVideo(videoName)
        }
        if (data.includes("Beatmap not found")) {
            sendProgression("beatmap_not_found")
            log.error("Cannot process replay because the local map is older (or newer?) than the map used by the replay. This is not a problem, waiting for another job.")
        }
        if (data.includes("panic")) {
            sendProgression("panic")
            reportPanic(data)
            let logString = "An error occured. Waiting for another job, though you might want to check what happened in the danser.log file."
            if (config.customServer.apiUrl === "") {
                log.error(logString)
            } else {
                log.error(logString + " This error has been automatically reported to o!rdr.")
            }
        }
        if (config.showFullDanserLogs) {
            console.log(data)
        }
    })
    danser.stderr.setEncoding("utf8")
    danser.stderr.on("data", data => {
        if (data.includes("Invalid data found")) {
            sendProgression("invalid_data")
        }
        if (data.includes("panic")) {
            sendProgression("panic")
            log.error("An error occured. Waiting for another job.")
        }
        if (config.showFullFFmpegLogs) {
            console.log(data)
        }
    })
}

exports.isRendering = value => {
    if (typeof value !== "boolean") {
        return isRendering
    } else {
        isRendering = value
    }
}
