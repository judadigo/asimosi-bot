export const environments = {
    bot: {
        server: 'irc.hirana.net',
        botName: 'Asimosi',
        channels: [
            '#main',
            '#underc0de'
        ],
        password: '',
        rulette: {
            command: '-info',
            cooldown: 60*1000, // 60 seconds.
        },
        join: {
            command: 'join',
        }
    }
};