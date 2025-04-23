const Fuse = require("fuse.js")
const { PROJECT, SITE, LIGHT_220, LIGHT_LED
    , LIGHT_RGB, VALVE_WATER, VALVE_HEATING, WARM_FLOOR
    , AC, FAN, SOCKET_220, BOILER, PUMP, SCRIPT,
    ACTION_ON,
    ACTION_OFF,
    ACTION_SCRIPT_RUN
} = require("../constants")
const { state, get } = require("../controllers/state")
const { run } = require("../controllers/service")
const { applySite } = require("../actions")
const { getAllForms } = require("./lang/ru")

const actions = [
    {
        id: ACTION_ON,
        type: "action",
        action: "включи",
        answer: {
            pc: "включаю",
            inf: "включить",
        }
    },
    {
        id: ACTION_OFF,
        type: "action",
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
    minMatchCharLength: 1,
    shouldSort: true,

})

const initIndex = (data) => makeIndex(data, ['code', 'forms'])

const actionIndex = makeIndex(actions, ['action'])
let scriptIndex = initIndex({})
let subjectIndex = initIndex({})
let siteIndex = initIndex({})
let typeIndex = initIndex({})

let timeout

const initAssistDelayed = () => {
    clearTimeout(timeout)
    timeout = setTimeout(initAssist, 1000)
}

const prepare = id => {
    const { code, title, type } = get(id) || {}
    const titles = title ? title.split(" ") : []
    return {
        id,
        code,
        type,
        title,
        titles,
        forms: getForms(titles)
    }
}

const initAssist = () => {
    const { mac } = state()
    const scripts = []
    const subjects = []
    const sites = []
    applySite(mac, (site) => {
        for ([key, value] of Object.entries(site)) {
            switch (key) {
                case SCRIPT:
                    for (const id of value) {
                        scripts.push(prepare(id))
                    }
                    break
                case PROJECT:
                    sites.push(prepare(value))
                    break
                case SITE:
                    for (const id of value) {
                        sites.push(prepare(id))
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
                        subjects.push(prepare(id))
                    }
                    break
            }
        }
    })
    subjectIndex = initIndex(subjects)
    scriptIndex = initIndex(scripts)
    siteIndex = initIndex(sites)
}

const handleAssist = (action) => {
    const words = action.payload.message.split(" ")

    findActions(words);

    return;

    const scripts = search(words, scriptIndex)
    const subjects = search(words, subjectIndex)
    const sites = search(words, siteIndex)

    console.log(action)

    const res = []
    for (const action of actions.values()) {
        res.push(action)
    }
    for (const subject of subjects.values()) {
        res.push(subject)
    }


    console.log(JSON.stringify(res, null, 2))

    let answer = "Ага!"

    action.payload.message = answer
    return action
}

const findActions = (words) => {
    const res = [];
    for (let position = 0; position < words.length; position += 1) {
        actions = actionIndex.search(words[position])
        if (actions.length > 0) {
            res.push({
                actions,
                position
            })
        }
    }
    console.log(res);
    return res
}

const search = (keywords, index) => {
    const res = new Map()
    for (const keyword of keywords) {
        const items = index.search(keyword)
        for (const { item, score } of items) {
            const s = score > 0.001 ? score : 0.001
            if (res.has(item.id)) {
                res.get(item.id).score *= s
            } else {
                res.set(item.id, { ...item, score: s })
            }
        }
    }
    return res
}

const getTitle = ({ title, code }) => title || code

const getForms = (words) => {
    const res = []
    for (const word of words) {
        for (form of getAllForms(word))
            res.push(form)
    }
    console.log(res)
    return res
}


module.exports = { initAssist, initAssistDelayed, handleAssist }
