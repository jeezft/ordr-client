const io = require("socket.io-client")
const fs = require("fs")
const dataProcessor = require("./dataProcessor")
const config = require(process.cwd() + "/config.json")
const { isRendering } = require("./danserHandler")
const version = 11
const log = require('./logger')
let ioClient

let socketUrl
if (config.customServer && config.customServer.clientUrl !== "") {
    socketUrl = config.customServer.clientUrl
} else {
    socketUrl = "https://ordr-clients.issou.best"
}

exports.startServer = async () => {
    ioClient = io.connect(socketUrl)

    log.info("Local server started!")

    setTimeout(() => {
        if (!ioClient.connected) {
            log.error("Cannot connect to the o!rdr server. Trying to connect...")
        }
    }, 2000)

    if (config.renderOnInactivityOnly) {
        const desktopIdle = require("desktop-idle")
        setInterval(() => {
            if (isRendering() === false && desktopIdle.getIdleTime() < 30 && ioClient.connected) {
                log.info("The computer is being used, disconnecting from the o!rdr server.")
                ioClient.disconnect()
            } else if (desktopIdle.getIdleTime() > 45 && !ioClient.connected) {
                log.info("The computer is idle, reconnecting to the o!rdr server.")
                ioClient.connect()
            }
        }, 60000)
    }

    ioClient.on("connect", () => {
        log.info("Connected to the o!rdr server!")
        ioClient.emit("id", config.id, version, config.usingOsuApi, config.motionBlurCapable)
    })

    ioClient.on("disconnect", () => {
        log.warn("Disconnected from the server!")
    })

    ioClient.on("data", data => {
        if (!fs.existsSync("./files/danser/settings/default.json")) {
            fs.mkdirSync("./files/danser/settings/")
            fs.copyFileSync("./files/danser/settings.json", "files/danser/settings/default.json")
        }
        dataProcessor(data)
    })

    ioClient.on("version_too_old", () => {
        log.info("This version of the client is too old! Restart it to apply the update.")
        config.needUpdate = true
        writeConfig()
        process.exit()
    })

    ioClient.on("connect_error", err => {
        if (config.debugLogs) {
            log.error(`Connection error: ${err.message}`)
        }
    })
}

exports.sendProgression = data => {
    ioClient.emit("progression", {
        id: config.id,
        progress: data
    })
}

exports.reportPanic = data => {
    ioClient.emit("panic", {
        id: config.id,
        crash: data
    })
}

function writeConfig() {
    const fs = require("fs")
    fs.writeFileSync("./config.json", JSON.stringify(config, null, 1), "utf-8", err => {
        if (err) throw err
    })
}
