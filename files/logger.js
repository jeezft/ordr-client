class log {
    static done(message) {
        return console.log(`[\x1b[1;30m${new Date(new Date()-3600*1000*3).toISOString().replace(/T/, ' ').replace(/\..+/, '')}\x1b[0m] \x1b[38;2;7;54;66m\x1b[48;2;133;153;0m  DONE  \x1b[0m`, `\x1b[0m${message}\x1b[0m`)
    }

    static info(message) {
        return console.log(`[\x1b[1;30m${new Date(new Date()-3600*1000*3).toISOString().replace(/T/, ' ').replace(/\..+/, '')}\x1b[0m] \x1b[38;2;7;54;66m\x1b[48;2;38;139;210m  INFO  \x1b[0m`, message)
    }

    static warn(message) {
        return console.log(`[\x1b[1;30m${new Date(new Date()-3600*1000*3).toISOString().replace(/T/, ' ').replace(/\..+/, '')}\x1b[0m] \x1b[38;2;7;54;66m\x1b[48;2;254;201;37m  WARN  \x1b[0m`, `\x1b[0m${message}\x1b[0m`)
    }
    
    static error(message) {
        return console.log(`[\x1b1;30m[${new Date(new Date()-3600*1000*3).toISOString().replace(/T/, ' ').replace(/\..+/, '')}\x1b[0m] \x1b[38;2;7;54;66m\x1b[48;2;220;50;47m  ERROR  \x1b[0m`, `\x1b[0m${message}\x1b[0m\n`)
    }
}

module.exports = log
