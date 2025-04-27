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
const { similarity, closest, compare } = require("./levenshtein")

const allScripts = []
const allSubjects = []
const allSites = []

const allActions = [
    {
        id: ACTION_ON,
        type: "action",
        forms: ["включи", "включить"],
        answer: {
            inf: "включить",
            pc: "включаю",
        }
    },
    {
        id: ACTION_OFF,
        type: "action",
        forms: ["выключи", "выключить"],
        answer: {
            inf: "выключить",
            pc: "выключаю",
        }
    },
]

let timeout

const initAssist = () => {
    const { mac } = state()
    applySite(mac, (site) => {
        for ([key, value] of Object.entries(site)) {
            switch (key) {
                case SCRIPT:
                    for (const id of value) {
                        allScripts.push(prepare(id))
                    }
                    break
                case PROJECT:
                    allSites.push(prepare(value))
                    break
                case SITE:
                    for (const id of value) {
                        allSites.push(prepare(id))
                    }
                    break
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
                        allSubjects.push(prepare(id))
                    }
                    break
            }
        }
    })
    console.log(allActions)
    console.log(allScripts)
    console.log(allSites)
    console.log(allSubjects)
}

const initAssistDelayed = () => {
    clearTimeout(timeout)
    timeout = setTimeout(initAssist, 1000)
}

const prepare = id => {
    const { code, title, type } = get(id) || {}
    const words = title ? title.split(" ") : []
    const forms = getForms(words)
    return { id, code, type, title, words, forms }
}

const getForms = (words) => {
    const res = []
    for (const word of words) {
        const forms = getAllForms(word)
        if (forms.length > 0) {
            res.push(forms.map(form => form.replace("ё\g", "е")))
        } else {
            res.push([word])
        }
    }
    return res
}

const handleAssist = (action) => {
    console.log(action)

    const words = action.payload.message.split(" ")

    const actions = markup(words, allActions);
    const scripts = markup(words, allScripts);
    const sites = markup(words, allSites);
    const subjects = markup(words, allSubjects)

    console.log("actions", actions)
    console.log("scripts", scripts)
    console.log("sites", sites)
    console.log("subjects", subjects)

    let answer = "Ага!"

    action.payload.message = answer
    return action
}

const threshold = 0.9

const markup = (words, items) => {
    const its = items.map(item => ({ ...item, score: 0 }))
    const res = words.map(word => ({ word, items: [] }))
    for (const r of res) {
        for (const it of its) {
            console.log(it)
            const s = closest(r.word, it.forms)
            if (s > threshold) {
                it.score += 1
                r.items.push(it)
            }
        }
    }
    return res;
}

// const getTitle = ({ title, code }) => title || code

module.exports = { initAssist, initAssistDelayed, handleAssist }
