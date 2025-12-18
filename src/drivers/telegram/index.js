const TelegramBot = require('node-telegram-bot-api');
const { get, set } = require('../../actions');

const bots = new Map();

module.exports.acceptBroadcast = true;

module.exports.run = (action) => {
    for (const [id, bot] of bots.entries()) {
        const { chats = [] } = get(id) || {};
        for (const chatId of chats) {
            const { title, message } = action;
            if (title) {
                bot.sendMessage(chatId, `<b>${title}</b>\n\n${message}`, {
                    parse_mode: 'HTML'
                });
            } else {
                bot.sendMessage(chatId, message);
            }
        }
    }
}

module.exports.handle = (action) => {
    console.log('Handle', action);
}

module.exports.clear = () => {
}

module.exports.add = (id) => {
    const { token } = get(id) || {};
    if (token) {
        if (!bots.has(id)) {
            const bot = new TelegramBot(token, { polling: true });
            bots.set(id, bot);
            bot.on('message', (msg, match) => {
                console.log('Telegram message', msg, match);
                const { chats = [] } = get(id) || {};
                if (!chats.includes(msg.chat.id)) {
                    set(id, { chats: [...chats, msg.chat.id] });
                }
            });

        }
    }
};
