module.exports = async type => {
    var spawn = require("child_process").spawn
    const config = require("../config.json")
    const fs = require("fs")
    const path = require("path")

    async function writeDanserConfig() {
        const danserConfig = require("./danser/settings/default.json")
        fs.writeFileSync("files/danser/settings/default.json", JSON.stringify(danserConfig, null, 1), "utf-8", err => {
            if (err) throw err
        })
    }

    if (type === "new") {
        setTimeout(() => {
            fs.mkdirSync("files/danser/Songs")
            fs.mkdirSync("files/danser/Skins")
            fs.mkdirSync("files/danser/rawReplays")
            fs.mkdirSync("files/danser/videos")
            config.danserSongsDir = path.resolve("files/danser/Songs")
            config.danserSkinsDir = path.resolve("files/danser/Skins")
            config.rawReplaysPath = path.resolve("files/danser/rawReplays")
            config.videosPath = path.resolve("files/danser/videos")
            if (process.platform === "win32") {
                config.danserPath = path.resolve("files/danser/danser.exe")
            } else {
                config.danserPath = path.resolve("files/danser/danser")
            }
            config.settingsPath = path.resolve("files/danser/settings/default.json")
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 1), "utf-8", err => {
                if (err) throw err
            })
        }, 1000)
    } else if (type === "change") {
        if (config.usingOsuApi) {
            if (!fs.existsSync("files/danser/api.txt")) {
                fs.writeFileSync("files/danser/api.txt", config.osuApiKey, "utf-8", err => {
                    if (err) throw err
                })
            }
            const currentApi = fs.readFileSync("files/danser/api.txt", "utf-8")
            if (currentApi !== config.osuApiKey) {
                fs.writeFileSync("files/danser/api.txt", config.osuApiKey, "utf-8", err => {
                    if (err) throw err
                })
            }
        }
        if (fs.existsSync(config.settingsPath)) {
            await fs.promises.unlink(config.settingsPath, err => {
                if (err) throw err
            })
        }
        // using -settings= argument to not trigger the rickroll
        var danserArguments = ["-settings="]
        spawn("files/danser/danser", danserArguments)
        setTimeout(() => {
            const danserConfig = require("./danser/settings/default.json")
            danserConfig.General.OsuSongsDir = config.danserSongsDir
            danserConfig.General.OsuSkinsDir = config.danserSkinsDir

            switch (true) {
                case config.encoder === "cpu":
                    danserConfig.Recording.Encoder = "libx264"
                    danserConfig.Recording.EncoderOptions = "-crf 21 -g 450"
                    danserConfig.Recording.Preset = "faster"
                    writeDanserConfig()
                    break
                case config.encoder === "nvidia":
                    danserConfig.Recording.Encoder = "h264_nvenc"
                    danserConfig.Recording.EncoderOptions = "-rc constqp -qp 26 -g 450"
                    danserConfig.Recording.Preset = "slow"
                    writeDanserConfig()
                    break
                case config.encoder === "amd":
                    danserConfig.Recording.Encoder = "h264_amf"
                    danserConfig.Recording.EncoderOptions = "-rc cqp -qp_p 17 -qp_i 17 -quality quality"
                    danserConfig.Recording.Preset = "slow" // H264_amf doesn't support -preset, instead using -quality (for some reason), keeping preset so it doesn't break anything
                    writeDanserConfig()
                    break
                case config.encoder === "intel":
                    danserConfig.Recording.Encoder = "h264_qsv"
                    danserConfig.Recording.EncoderOptions = "-global_quality 31 -g 450"
                    danserConfig.Recording.Preset = "veryslow"
                    writeDanserConfig()
                    break
            }
            writeDanserConfig()
        }, 4000)
    }
}
