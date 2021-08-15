const io = require("socket.io-client")
const fs = require("fs")
const dataProcessor = require("./dataProcessor")
const config = require("../config.json")
const { isRendering } = require("./danserHandler")
const version = 10
let ioClient

var socketUrl
if (config.customServer && config.customServer.clientUrl !== "") {
    socketUrl = config.customServer.clientUrl
} else {
    socketUrl = "https://ordr-clients.issou.best"
}

exports.startServer = async () => {
    ioClient = io.connect(socketUrl)

    console.log("Server started!")

    setTimeout(() => {
        if (!ioClient.connected) {
            console.log("Cannot connect to the o!rdr server. Trying to connect...")
        }
    }, 2000)

    if (config.renderOnInactivityOnly) {
        const desktopIdle = require("desktop-idle")
        setInterval(() => {
            if (isRendering() === false && desktopIdle.getIdleTime() < 30 && ioClient.connected) {
                console.log("The computer is being used, disconnecting from the o!rdr server.")
                ioClient.disconnect()
            } else if (desktopIdle.getIdleTime() > 45 && !ioClient.connected) {
                console.log("The computer is idle, reconnecting to the o!rdr server.")
                ioClient.connect()
            }
        }, 60000)
    }

    ioClient.on("connect", () => {
        console.log("Connected to the o!rdr server!")
        ioClient.emit("id", config.id, version, config.usingOsuApi, config.motionBlurCapable)
    })

    ioClient.on("disconnect", () => {
        console.log("Disconnected from the server!")
    })

    ioClient.on("data", data => {
        if (!fs.existsSync("./files/danser/settings/default.json")) {
            fs.mkdirSync("./files/danser/settings/")
            fs.copyFileSync("./files/danser/settings.json", "files/danser/settings/default.json")
        }
        dataProcessor(data)
    })

    ioClient.on("version_too_old", () => {
        console.log("This version of o!rdr-client is too old! Restart the client to apply the update.")
        config.needUpdate = true
        writeConfig()
        process.exit()
    })

    ioClient.on("connect_error", err => {
        if (config.debugLogs) {
            console.log(`Connection error: ${err.message}`)
        }
    })
}

exports.sendProgression = data => {
    ioClient.emit("progression", {
        id: config.id,
        progress: data
    })
}

function writeConfig() {
    const fs = require("fs")
    fs.writeFileSync("./config.json", JSON.stringify(config, null, 1), "utf-8", err => {
        if (err) throw err
    })
}
