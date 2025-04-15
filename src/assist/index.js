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

const actions = [
    {
        id: ACTION_ON,
        action: "включи",
        answer: {
            pc: "включаю",
            inf: "включить",
        }
    },
    {
        id: ACTION_OFF,
        action: "выключи",
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


const actionIndex = makeIndex(actions, ['action']);
let scriptIndex = initIndex({});
let subjectIndex = initIndex({});
let siteIndex = initIndex({});
let typeIndex = initIndex({});


let timeout;

const initAssistDelayed = () => {
    clearTimeout(timeout);
    timeout = setTimeout(initAssist, 1000)
}

const initAssist = () => {
    const data = state();
    const scripts = [];
    const subjects = [];
    const sites = [];
    applySite(data.mac, (site) => {
        for ([key, value] of Object.entries(site)) {
            switch (key) {
                case SCRIPT:
                    for (const id of value) {
                        const script = data[id]
                        scripts.push({ id, code: script.code, title: script.title });
                    }
                    break;
                case PROJECT:
                    const { code, title } = data[value];
                    sites.push({ id: value, code, title });
                    break;
                case SITE:
                    for (const id of value) {
                        const { code, title } = data[id] || {};
                        sites.push({ id, code, title })
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
                        const { code, title } = data[id];
                        subjects.push({ id, code, title });
                    }
                    break;
            }
        }
    });
    subjectIndex = initIndex(subjects);
    scriptIndex = initIndex(scripts);
    siteIndex = initIndex(sites);
}

const handleAssist = (action) => {
    const keywords = action.payload.message.split(" ")

    const scripts = search(keywords, scriptIndex);
    const actions = search(keywords, actionIndex);
    const subjects = search(keywords, subjectIndex);
    const sites = search(keywords, siteIndex);

    console.log("scripts", scripts);
    console.log("actions", actions);
    console.log("subjects", subjects);
    console.log("sites", sites);

    let answer = "Да, я тут!";

    action.payload.message = answer
    return action;
}

const search = (keywords, index) => {
    const res = new Map();
    for (const keyword of keywords) {
        const items = index.search(keyword);
        res.push(keyword, items)
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


module.exports = { initAssist, initAssistDelayed, handleAssist }
