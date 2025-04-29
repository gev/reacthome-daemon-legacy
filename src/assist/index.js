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
        forms: [["включи", "включить"]],
        answer: {
            inf: "включить",
            pc: "включаю",
        }
    },
    {
        id: ACTION_OFF,
        type: "action",
        forms: [["выключи", "выключить"]],
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

    const actions = markupWords(words, allActions)

    const fragments = sliceFragments(words, actions)

    const scripts = markupFragments(fragments, allScripts)
    const sites = markupFragments(fragments, allSites)
    const subjects = markupFragments(fragments, allSubjects)

    console.log("actions", actions)
    console.log("fragments", fragments)
    console.log("scripts", scripts)
    console.log("sites", sites)
    console.log("subjects", subjects)

    let answer = "Ага!"
    action.payload.message = answer
    return action
}

const sliceFragments = (words, items) => {
    const res = []
    let previous = 0
    for (const { position } of items) {
        const fragment = words.slice(previous, position)
        res.push({ items: fragment, position: previous })
        previous = position + 1
    }
    const fragment = words.slice(previous)
    if (fragment.length > 0) {
        res.push({ items: fragment, position: previous })
    }
    return res
}

const markupFragments = (fragments, items) => {
    res = []
    for (const fragment of fragments) {
        res.push(markupWords(fragment, items, fragment.position))
    }
    return res
}

const threshold = 0.9

const markupWords = (words, items, position = 0) => {
    const res = []
    const its = items.map(item => ({ ...item, score: 0 }))
    for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const stage1 = []
        let max = 0
        for (const it of its) {
            for (const form of it.forms) {
                const s = closest(word, form)
                if (s > threshold) {
                    it.score += 1
                    if (it.score > max) {
                        max = it.score
                    }
                    stage1.push(it)
                }
            }
        }
        if (stage1.length > 0) {
            const stage2 = []
            let min = 100000000
            for (const it of stage1) {
                if (it.score === max) {
                    stage2.push(it)
                    if (it.forms.length < min) {
                        min = it.forms.length
                    }
                }
            }
            const stage3 = []
            for (const it of stage2) {
                if (it.forms.length === min) {
                    stage3.push(it)
                }
            }
            res.push({ position: position + i, items: stage3 })
        }
    }
    return res
}

// const getTitle = ({ title, code }) => title || code

const log = (...its) =>
    its.forEach(it =>
        console.log(
            JSON.stringify(it, null, 2)
        )
    )

module.exports = { initAssist, initAssistDelayed, handleAssist }
