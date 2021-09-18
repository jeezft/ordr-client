const fs = require("fs")
const log = require("./files/logger")
const _color = require("colors")
let version = "v11"
console.clear()
console.log(_color.red(`                           /$$                             /$$ /$$                       /$$    
                          | $$                            | $$|__/                      | $$    
  /$$$$$$   /$$$$$$   /$$$$$$$  /$$$$$$           /$$$$$$$| $$ /$$  /$$$$$$  /$$$$$$$  /$$$$$$  
 /$$__  $$ /$$__  $$ /$$__  $$ /$$__  $$ /$$$$$$ /$$_____/| $$| $$ /$$__  $$| $$__  $$|_  $$_/  
| $$  \\ $$| $$  \\__/| $$  | $$| $$  \\__/|______/| $$      | $$| $$| $$$$$$$$| $$  \\ $$  | $$    
| $$  | $$| $$      | $$  | $$| $$              | $$      | $$| $$| $$_____/| $$  | $$  | $$ /$$
|  $$$$$$/| $$      |  $$$$$$$| $$              |  $$$$$$$| $$| $$|  $$$$$$$| $$  | $$  |  $$$$/
\\______/ |__/       \\_______/|__/               \\_______/|__/|__/ \\_______/|__/  |__/   \\___/  

] Made by RyuK 2#0001      Version: ${version}`))
console.log(_color.yellow(`⚠️ This build is not official!\n`))

if (!fs.existsSync(process.cwd() + "/config.json")) {
    fs.writeFileSync(process.cwd() + "/config.json", "{}", { encoding: "utf-8" })
}

const config = require(process.cwd() + "/config.json")
const { startServer } = require("./files/server")

if (typeof config.usingOsuApi === "undefined") {
    config.usingOsuApi = false
    config.osuApiKey = ""
    writeConfig()
}
if (typeof config.motionBlurCapable === "undefined") {
    config.motionBlurCapable = false
    writeConfig()
}
if (typeof config.debugLogs === "undefined") {
    config.debugLogs = false
    writeConfig()
}
if (typeof config.customServer === "undefined") {
    config.customServer = {
        clientUrl: "",
        apiUrl: ""
    }
    writeConfig()
}
if (typeof config.needUpdate === "undefined") {
    config.needUpdate = false
    writeConfig()
}
if (typeof config.deleteRenderedVideos === "undefined") {
    config.deleteRenderedVideos = false
    writeConfig()
}
if (typeof config.showFullDanserLogs === "undefined") {
    config.showFullDanserLogs = false
    writeConfig()
}
if (typeof config.showFullFFmpegLogs === "undefined") {
    config.showFullFFmpegLogs = false
    writeConfig()
}
if (typeof config.renderOnInactivityOnly === "undefined") {
    config.renderOnInactivityOnly = false
    writeConfig()
}
if (typeof config.relay === "undefined") {
    config.relay = "direct"
    writeConfig()
}

if (config.needUpdate) {
    const clientUpdater = require("./files/clientUpdater")
    config.needUpdate = false
    writeConfig()
    clientUpdater()
} else if (config.id && config.customServer.apiUrl === "") {
    const checkDanserVersion = require("./files/checkDanserVersion")
    checkDanserVersion()
} else if (config.id) {
    startServer()
} else {
    const firstLaunch = require("./files/firstLaunch")
    firstLaunch()
}

function writeConfig() {
    fs.writeFileSync("./config.json", JSON.stringify(config, null, 1), "utf-8", err => {
        if (err) throw err
    })
}
