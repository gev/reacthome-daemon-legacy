const fs = require("fs");
const Fuse = require("fuse.js");
const { PROJECT, SITE, LIGHT_220, LIGHT_LED
    , LIGHT_RGB, VALVE_WATER, VALVE_HEATING, WARM_FLOOR
    , AC, FAN, SOCKET_220, BOILER, PUMP, SCRIPT,
    ACTION_ON,
    ACTION_OFF,
    ACTION_SCRIPT_RUN
} = require("../constants");
const { state } = require("../controllers/state");
const { run } = require("../controllers/service");
const { applySite } = require("../actions");

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
let siteIndex = initIndex({});


let timeout;

const initAssistDelayed = () => {
    clearTimeout(timeout);
    timeout = setTimeout(initAssist, 1000)
}

const initAssist = () => {
    const data = state();
    const scripts = [];
    const things = [];
    const sites = [];
    applySite(data.mac, (site) => {
        for ([key, value] of Object.entries(site)) {
            switch (key) {
                case PROJECT:
                    const project = data[value];
                    things.push({
                        id: value,
                        type: project.type,
                        code: project.code,
                        title: project.title,
                    });
                    break;
                case SCRIPT:
                    for (const id of value) {
                        const script = data[id]
                        scripts.push({ id, code: script.code, title: script.title });
                    }
                    break;
                case SITE:
                    for (const id of value) {
                        const item = data[id];
                        const details = getDetails(data, item.site)
                        sites.push({
                            id,
                            type: item.type,
                            code: item.code && [item.code, ...details.code],
                            title: item.title && [item.title, ...details.title],
                        })
                    }
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
                    for (const id of value) {
                        const item = data[id];
                        things.push({
                            id,
                            type: item.type,
                            code: item.code,
                            title: item.title,
                        });
                    }
                    break;
            }
        }
    });
    console.log(scripts)
    console.log(things)
    console.log(sites);
    thingIndex = initIndex(things);
    scriptIndex = initIndex(scripts);
    siteIndex = initIndex(sites);
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
        if (scripts.length == 1) {
            const script = scripts[0]
            const scriptTitle = getTitle(script);
            answer = "Выполняю скрипт: " + scriptTitle;
            const action = ({ type: ACTION_SCRIPT_RUN, id: script.id })
            console.log(action);
            run(action);
        } else {
            const scriptTitles = getTitles(scripts)
            answer = "Уточните какой скрипт выполнить: " + scriptTitles
        }
    } else {
        const commands = searchCommands(keywords, commandIndex);
        const things = search(keywords, thingIndex);
        if (commands.length == 1) {
            const command = commands[0];
            if (things.length === 1) {
                const thing = things[0]
                const thingTitle = getTitle(thing);
                answer = command.answer.pc + " " + thingTitle;
                const action = { type: command.id, id: thing.id }
                console.log(action)
                run(action);
            } else if (things.length === 0) {
                answer = "Уточните, что именно " + command.answer.inf;
            } else {
                const thingTitles = getTitles(things);
                answer = "Я могу " + command.answer.inf + " " + thingTitles +
                    ". Уточните, что именно " + command.answer.inf;
            }
        } else if (commands.length > 1) {
            const commandTitles = commands.map(i => i.answer.inf);
            const thingTitles = getTitles(things);
            answer = "Я могу " + commandTitles + ": " + thingTitles;
        } else {
            if (things.length > 0) {
                const thingTitles = getTitles(things);
                answer = "Что сделать с: " + thingTitles + "?";
            } else {
                answer = "Идите в баню"
            }
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

const getTitle = ({ title, code }) => title || code;

const getTitles = (some) => {
    const res = [];
    for (const item of some) {
        res.push(getTitle(item))
    }
    return res.join(", ");
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
                console.log(some);
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
    console.log(res)
    return res;
}
module.exports = { initAssist, initAssistDelayed, handleAssist }
