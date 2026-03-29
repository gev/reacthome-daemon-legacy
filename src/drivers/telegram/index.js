const TelegramBot = require('node-telegram-bot-api');
const { get, set } = require('../../actions');

const bots = new Map();

module.exports.acceptBroadcast = true;

module.exports.run = async (action) => {
    for (const [id, bot] of bots.entries()) {
        const { chats = [] } = get(id) || {};
        for (const chatId of chats) {
            const { title, message } = action;
            try {
                if (title) {
                    await bot.sendMessage(chatId, `<b>${title}</b>\n\n${message}`, {
                        parse_mode: 'HTML'
                    });
                } else {
                    await bot.sendMessage(chatId, message);
                }
            } catch (e) {
                set(id, { chats: chats.filter(c => c !== chatId) });
            }
        }
    }
}

module.exports.handle = (action) => {
    // console.log('Handle', action);
}

module.exports.clear = () => {
    for (bot of bots) {
        bot.stopPolling();
    }
}

const connect = (id) => {
    const { token } = get(id) || {};
    if (token) {
        if (!bots.has(id)) {
            const bot = new TelegramBot(token, { polling: true });
            bots.set(id, bot);
            bot.on('polling_error', console.error);
            bot.on('message', (msg, match) => {
                const [cmd, daemon] = msg.text.normalize().split(' ');
                switch (cmd) {
                    case '/start': {
                        if (daemon === get('mac')) {
                            const { chats = [] } = get(id) || {};
                            if (!chats.includes(msg.chat.id)) {
                                set(id, { chats: [...chats, msg.chat.id] });
                                bot.sendMessage(msg.chat.id, 'Уведомления включены');
                            } else {
                                bot.sendMessage(msg.chat.id, 'Уведомления уже включены');
                            }
                        } else {
                            bot.sendMessage(msg.chat.id, 'Неверный код');
                        }
                        break;
                    }
                    case '/stop': {
                        const { chats = [] } = get(id) || {};
                        set(id, { chats: chats.filter(c => c !== msg.chat.id) });
                        bot.sendMessage(msg.chat.id, 'Уведомления отключены');
                        break;
                    }
                }
            });
        }
    }

}

module.exports.add = (id) => {
    connect(id);
};  
