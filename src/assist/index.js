const Fuse = require("fuse.js")
const { PROJECT, SITE, LIGHT_220, LIGHT_LED
    , LIGHT_RGB, VALVE_WATER, VALVE_HEATING, WARM_FLOOR
    , AC, FAN, SOCKET_220, BOILER, PUMP, SCRIPT,
    ACTION_ON,
    ACTION_OFF,
    ACTION_SCRIPT_RUN
} = require("../constants")
const { state } = require("../controllers/state")
const { run } = require("../controllers/service")
const { applySite } = require("../actions")
const { getAllForms } = require("./lang/ru")

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

const prepare = o => ({
    ...o,
    title: o.title && o.title.split(" ")
})

const initAssist = () => {
    const data = state()
    const scripts = []
    const subjects = []
    const sites = []
    applySite(data.mac, (site) => {
        for ([key, value] of Object.entries(site)) {
            switch (key) {
                case SCRIPT:
                    for (const id of value) {
                        const { code, title, } = data[id] || {}
                        const forms = getForms(title)
                        scripts.push(prepare({ id, code, title, forms }))
                    }
                    break
                case PROJECT:
                    const { code, title } = data[value] || {}
                    const forms = getForms(title)
                    sites.push(prepare({ id: value, code, title, forms }))
                    break
                case SITE:
                    for (const id of value) {
                        const { code, title } = data[id] || {}
                        const forms = getForms(title)
                        sites.push(prepare({ id, code, title, forms }))
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
                        const { code, type, title } = data[id] || {}
                        const forms = getForms(title)
                        subjects.push(prepare({ id, code, type, title, forms }))
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
    const keywords = action.payload.message.split(" ")

    const scripts = search(keywords, scriptIndex)
    const actions = search(keywords, actionIndex)
    const subjects = search(keywords, subjectIndex)
    const sites = search(keywords, siteIndex)

    console.log(action)

    const res = []
    for (const action of actions.values()) {
        if (subjects.size > 0) {
            for (const subject of subjects.values()) {
                res.push({
                    action,
                    subject,
                    score: (action.score + subject.score) / 2
                })
            }
        } else {
            res.push({ action, score: action.score })
        }
    }

    console.log(JSON.stringify(res, null, 2))

    let answer = "Да ты, батюшка, только скажи как!"

    action.payload.message = answer
    return action
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

const getForms = (text) => {
    if (!text) return []
    const res = []
    for (const word of text.split(" ")) {
        for (form of getAllForms(word))
            res.push(form)
    }
    console.log(res)
    return res
}


module.exports = { initAssist, initAssistDelayed, handleAssist }
