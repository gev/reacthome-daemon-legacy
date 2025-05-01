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
const { closest } = require("./levenshtein")

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
                        push(allScripts, prepare(id))
                    }
                    break
                case PROJECT:
                    push(allSites, prepare(value))
                    break
                case SITE:
                    for (const id of value) {
                        push(allSites, prepare(id))
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
                        push(allSubjects, prepare(id))
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

const push = (items, item) => {
    if (item.forms.length > 0) {
        items.push(item)
    }
}

const prepare = (id) => {
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
            res.push(forms)
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
        if (position > 0) {
            const fragment = words.slice(previous, position)
            res.push({ words: fragment, position: previous })
        }
        previous = position + 1
    }
    const fragment = words.slice(previous)
    if (fragment.length > 0) {
        res.push({ words: fragment, position: previous })
    }
    return res
}

const markupFragments = (fragments, items) => {
    res = []
    for (const fragment of fragments) {
        const its = markupWords(fragment.words, items, fragment.position)
        if (its.length > 0) {
            res.push(its)
        }
    }
    return res
}

const threshold = 0.7

const markupWords = (words, items, position = 0) => {
    const stage0 = new Map()
    const its = items.map(item => ({ ...item, score: 0 }))
    for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const closestItems = selectClosest(its, word)
        if (closestItems.length > 0) {
            for (const it of closestItems) {
                const matches = { word, position: position + i }
                if (stage0.has(it)) {
                    stage0.get(it).push(matches)
                } else {
                    stage0.set(it, [matches])
                }
            }
        }
    }
    const stage1 = []
    for (const [it, matches] of stage0.entries()) {
        state1.push({ ...it, matches })
    }
    return stage1
}

const selectClosest = (items, word) => {
    // State 0: Select closest items by distance
    const stage0 = []
    let minDistance = Number.MAX_SAFE_INTEGER;
    for (const it of items) {
        let distance = Number.MAX_SAFE_INTEGER;
        for (const form of it.forms) {
            const c = closest(word, form)
            if (c.distance < distance) {
                distance = c.distance
                it.closest = c;
            }
        }
        if (it.closest.similarity > threshold) {
            if (it.closest.distance < minDistance) {
                minDistance = it.closest.distance
            }
            stage0.push(it)
        }
    }
    // State 1: filter by the minimum distance
    const stage1 = []
    let maxScore = 0
    for (const it of stage0) {
        if (it.closest.distance === minDistance) {
            it.score += 1
            if (it.score > maxScore) {
                maxScore = it.score
            }
            delete it.closest
            stage1.push(it)
        }
    }
    // State 2: filter by the maximum score
    const stage2 = []
    let minLength = Number.MAX_SAFE_INTEGER
    for (const it of stage1) {
        if (it.score === maxScore) {
            stage2.push(it)
            if (it.forms.length < minLength) {
                minLength = it.forms.length
            }
        }
    }
    // State 3: filter by the minimum length
    const stage3 = []
    for (const it of stage2) {
        if (it.forms.length === minLength) {
            stage3.push(it)
        }
    }
    return stage3
}

// const getTitle = ({ title, code }) => title || code

const log = (...its) =>
    its.forEach(it =>
        console.log(
            JSON.stringify(it, null, 2)
        )
    )

module.exports = { initAssist, initAssistDelayed, handleAssist }
