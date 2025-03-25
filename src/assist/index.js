const fs = require("fs");
const Fuse = require("fuse.js");
const { PROJECT, SITE, LIGHT_220, LIGHT_LED
    , LIGHT_RGB, VALVE_WATER, VALVE_HEATING, WARM_FLOOR
    , AC, FAN, SOCKET_220, BOILER, PUMP, SCRIPT,
    ACTION_ON,
    ACTION_OFF
} = require("../constants");
const { state } = require("../controllers/state");


const commands = [
    {
        id: ACTION_ON,
        command: "включи",
        answer: {
            pc: "включаю",
            inf: "включить",
        }
    },
    {
        id: ACTION_OFF,
        command: "выключи",
        answer: {
            inf: "выключить",
            pc: "выключаю",
        }
    },
]

const makeIndex = (data, keys) => new Fuse(data, {
    keys,
    threshold: 0.4,
    includeScore: true,
    isCaseSensitive: false,
    minMatchCharLength: 3,


    shouldSort: true,

})


const initIndex = (data) => makeIndex(data, ['code', 'title']);


const commandIndex = makeIndex(commands, ['command']);
let scriptIndex = initIndex({});
let thingIndex = initIndex({});

const initAssist = () => {
    const data = state();
    const scripts = [];
    const things = [];
    for ([id, item] of Object.entries(data)) {
        switch (item.type) {
            case SCRIPT:
                scripts.push({ id, code: item.code, title: item.title });
                break;
            case PROJECT:
            case SITE:
            case LIGHT_220:
            case LIGHT_LED:
            case LIGHT_RGB:
            case VALVE_WATER:
            case VALVE_HEATING:
            case WARM_FLOOR:
            case AC:
            case FAN:
            case SOCKET_220:
            case BOILER:
            case PUMP:
                details = getDetails(data, item.site)
                things.push({
                    id,
                    type: item.type,
                    code: item.code && [item.code, ...details.code],
                    title: item.title && [item.title, ...details.title],
                });
                break;
        }
    }
    thingIndex = initIndex(things);
    console.log(scripts)
    scriptIndex = initIndex(scripts);
    fs.writeFileSync("var/tmp/state.json", JSON.stringify(things, null, 4))
}

const getDetails = (state, id) => {
    const site = id && state[id];
    if (site) {
        const details = getDetails(state, site.parent)
        const code = site.code ? [site.code, ...details.code] : details.code
        const title = site.title ? [site.title, ...details.title] : details.title
        return ({ code, title })
    }
    return ({ code: [], title: [] })
}

const handleAssist = (action) => {
    console.log(action);
    const keywords = action.payload.message.split(" ")
    console.log(keywords)
    const scripts = search(keywords, scriptIndex);


    let answer;

    if (scripts.length > 0) {
        answer = "Выполняю скрипт: " + getTitles(scripts).join(", ");
    } else {
        const commands = searchCommands(keywords, commandIndex);
        const things = search(keywords, thingIndex);
        const titles = getTitles(things)
        if (commands.length > 0) {
            const command = (t) => commands.map(i => i.answer[t]).join(", ");
            if (titles.length === 1) {
                answer = command("pc") + " " + titles[0]
            } else {
                answer = "Уточните, что именно " + command("inf");
            }
        } else if (titles.length > 0) {
            answer = "Я нашла: " + titles.join(", ")
        } else {
            answer = "Идите в баню"
        }
    }


    action.payload.message = answer
    return action;
}

const searchCommands = (keywords, index) => {
    const res = [];
    for (const keyword of keywords) {
        const commands = index.search(keyword);
        if (commands.length > 0) {
            res.push(commands[0].item)
        }
    }
    return res;
}

const getTitles = (some) => {
    const res = [];
    for (const { title, code } of some) {
        res.push(title || code)
    }
    return res;
}

const search = (keywords, index) => {
    const ids = new Set();
    const all = new Map();
    const sub = [];
    for (const keyword of keywords) {
        const some = index.search(keyword);
        if (some.length > 0) {
            const set = new Set();
            for (const { item } of some) {
                ids.add(item.id);
                all.set(item.id, item);
                set.add(item.id);
            }
            console.log(keyword, set);
            sub.push(set)
        }
    }
    const res = []
    for (const id of ids) {
        let isGood = true;
        for (const s of sub) {
            if (!s.has(id)) {
                isGood = false;
                break;
            }
        }
        if (isGood) {
            res.push(all.get(id))
        }
    }
    return res;
}
module.exports = { initAssist, handleAssist }
