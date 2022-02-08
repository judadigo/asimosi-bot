export const environments = {
    bot: {
        server: process.env.SERVER ? process.env.SERVER : 'irc.hirana.net',
        botName: process.env.NICK ? process.env.NICK : 'Asimosi',
        channels: [
            '#probando',
            // '#underc0de'
        ],
        password: process.env.PASSWORD ? process.env.PASSWORD : '',
        rulette: {
            command: '-info',
            cooldown: 60*1000, // 60 seconds.
        },
        join: {
            command: 'join',
        }
    }
};