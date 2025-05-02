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

let allScripts = []
let allSubjects = []
let allSites = []

const allCommands = [
    {
        id: ACTION_ON,
        type: "command",
        forms: [["включи", "включить"]],
        answer: {
            inf: "включить",
            pc: "включаю",
        }
    },
    {
        id: ACTION_OFF,
        type: "command",
        forms: [["выключи", "выключить"]],
        answer: {
            inf: "выключить",
            pc: "выключаю",
        }
    },
]

let timeout

const initAssist = () => {
    allScripts = []
    allSubjects = []
    allSites = []
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
                    const project = prepare(value)
                    addSites(project)
                    push(allSites, project)
                    break
                case SITE:
                    for (const id of value) {
                        const site = prepare(id)
                        addSites(site)
                        push(allSites, site)
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

const addSites = (it) => {
    it.sites = new Set()
    applySite(it.id, (_, id) => it.sites.add(id))
}

const prepare = (id) => {
    const it = get(id) || {}
    const words = getAllTitles(it);
    const forms = getForms(words)
    return { ...it, id, words, forms }
}

const getAllTitles = (it, titles = []) => {
    if (it.title) {
        for (const t of it.title.split(" ")) {
            titles.push(t)
        }
    }
    const parent = it.parent && get(it.parent)
    if (parent) {
        getAllTitles(parent, titles)
    }
    return titles
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

    const commands = markupWords(words, allCommands)

    const fragments = sliceFragments(words, commands)

    // const scripts = markupFragments(fragments, allScripts)
    const sites = markupFragments(fragments, allSites, true)
    const subjects = markupFragments(fragments, allSubjects, false)

    const actions = combine(commands, subjects, sites)
    const res = resolve(actions)

    // console.log("commands", commands)
    // console.log("fragments", fragments)
    // console.log("scripts", scripts)
    // console.log("sites", sites)
    // console.log("subjects", subjects)
    log("actions", res)

    let answer = "Ага!"
    action.payload.message = answer
    return action
}

const resolve = (actions) => {
    const res = []
    for (const it of actions) {
        if (it.sites.size > 0) {
            const subjects = []
            for (const subject of it.subjects) {
                if (it.sites.has(subject.site)) {
                    subjects.push(subject)
                }
            }
            it.subjects = subjects
        }
        it.subjects = filterClosest(it.subjects)
        res.push(it)
    }
    return res
}

const combine = (commands, subjects, sites) => {
    const res = []
    if (commands.length > 0) {
        let where = new Set()
        for (let i = 0; i < commands.length; i += 1) {
            const command = commands[i]
            const its = subjects[i]
            const sites_ = sites[i]
            if (sites_) {
                where = new Set()
                for (const it of sites_) {
                    for (const id of it.sites) {
                        where.add(id)
                    }
                }
            }
            res.push({
                command,
                subjects: its ? its : [],
                sites: where,
            })
        }
        const last = res[commands.length - 1]
        for (let i = commands.length; i < subjects.length; i += 1) {
            for (const it of subjects[i]) {
                last.subjects.push(it)
            }
        }
        for (let i = commands.length; i < sites.length; i += 1) {
            for (const it of sites[i]) {
                for (const id of it.sites) {
                    last.sites.add(id)
                }
            }
        }
    }
    return res
}

const sliceFragments = (words, items) => {
    const res = []
    let previous = 0
    for (const it of items) {
        const firstPosition = it.matches[0].position
        if (firstPosition > 0) {
            const fragment = words.slice(previous, firstPosition)
            res.push({ words: fragment, position: previous })
        }
        const lastPosition = it.matches[it.matches.length - 1].position
        previous = lastPosition + 1
    }
    const fragment = words.slice(previous)
    if (fragment.length > 0) {
        res.push({ words: fragment, position: previous })
    }
    return res
}

const markupFragments = (fragments, items, shouldFilterClosest) => {
    res = []
    for (const fragment of fragments) {
        const its = markupWords(fragment.words, items, fragment.position, shouldFilterClosest)
        if (its.length > 0) {
            res.push(its)
        }
    }
    return res
}

const threshold = 0.7

const markupWords = (words, items, position = 0, shouldFilterClosest) => {
    const stage1 = new Set()
    const its = items.map(item => ({ ...item, matches: [], score: 0 }))
    for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const closestItems = selectClosest(its, word)
        for (const it of closestItems) {
            it.matches.push({ word, position: position + i })
            stage1.add(it)
        }
    }
    const stage2 = [...stage1]
    if (shouldFilterClosest) {
        const stage3 = filterClosest(stage2)
        return stage3
    } else {
        return stage2
    }
}

const selectClosest = (items, word) => {
    // Stage 1: Select closest items by distance
    const stage1 = []
    let minDistance = Number.MAX_SAFE_INTEGER
    for (const it of items) {
        let distance = Number.MAX_SAFE_INTEGER
        for (const form of it.forms) {
            const c = closest(word, form)
            if (c.distance < distance) {
                distance = c.distance
                it.closest = c
            }
        }
        if (it.closest.similarity > threshold) {
            if (it.closest.distance < minDistance) {
                minDistance = it.closest.distance
            }
            stage1.push(it)
        }
    }
    // Stage 2: filter by the minimum distance
    const stage2 = []
    for (const it of stage1) {
        if (it.closest.distance === minDistance) {
            it.score += 1
            stage2.push(it)
        }
    }
    return stage2
}

const filterClosest = (items) => {
    // Stage 0: get max score
    let maxScore = 0
    for (const it of items) {
        if (it.score > maxScore) {
            maxScore = it.score
        }
    }
    // Stage 1: filter by the maximum score
    const stage1 = []
    let minLength = Number.MAX_SAFE_INTEGER
    for (const it of items) {
        if (it.score === maxScore) {
            stage1.push(it)
            if (it.forms.length < minLength) {
                minLength = it.forms.length
            }
        }
    }
    // State 2: filter by the minimum length
    const stage2 = []
    for (const it of stage1) {
        if (it.forms.length === minLength) {
            stage2.push(it)
        }
    }
    return stage2
}

// const getTitle = ({ title, code }) => title || code

const log = (...its) =>
    its.forEach(it =>
        console.log(
            JSON.stringify(it, null, 2)
        )
    )

module.exports = { initAssist, initAssistDelayed, handleAssist }
