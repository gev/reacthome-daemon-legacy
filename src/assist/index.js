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
const { similarity, closest } = require("./levenshtein")

const scripts = []
const subjects = []
const sites = []

const actions = [
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

const initAssistDelayed = () => {
    clearTimeout(timeout)
    timeout = setTimeout(initAssist, 1000)
}

const prepare = id => {
    const { code, title, type } = get(id) || {}
    const words = title ? title.split(" ") : []
    return {
        id,
        code,
        type,
        title,
        words,
        forms: getForms(words)
    }
}

const initAssist = () => {
    const { mac } = state()
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
}

const handleAssist = (action) => {
    console.log(action)

    const words = action.payload.message.split(" ")

    const parts = []
    let prev = 0
    for (const act of findActions(words)) {
        const part = words.slice(prev, act.position)
        parts.push(mkPart(part))
        parts.push(act.action)
        prev = act.position + 1
    }
    parts.push(mkPart(words.slice(prev)))
    console.log(parts)

    // const scripts = search(words, scriptIndex)
    // const subjects = search(words, subjectIndex)
    // const sites = search(words, siteIndex)

    // 

    // const res = []
    // for (const action of actions.values()) {
    //     res.push(action)
    // }
    // for (const subject of subjects.values()) {
    //     res.push(subject)
    // }


    // console.log(JSON.stringify(res, null, 2))

    let answer = "Ага!"

    action.payload.message = answer
    return action
}

const mkPart = (part) => ({ type: 'part', part })

const findActions = (words) => {
    const res = [];
    for (let position = 0; position < words.length; position += 1) {
        const word = words[position]
        const acts = [];
        for (const action of actions) {
            const sim = closest(word, action.forms)
            if (sim > 0.9) {
                acts.push({
                    type: 'action',
                    action,
                    similarity: sim
                })
            }
        }
        if (acts.length > 0) {
            res.push({
                word,
                position,
                actions: acts,
            })
        }
    }
    return res
}

// const search = (keywords, index) => {
//     const res = new Map()
//     for (const keyword of keywords) {
//         const items = index.search(keyword)
//         for (const { item, score } of items) {
//             const s = score > 0.001 ? score : 0.001
//             if (res.has(item.id)) {
//                 res.get(item.id).score *= s
//             } else {
//                 res.set(item.id, { ...item, score: s })
//             }
//         }
//     }
//     return res
// }

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
