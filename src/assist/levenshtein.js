const { distance } = require("fastest-levenshtein")



const similarity = (a, b) => {
    const l = a.length > b.length ? a.length : b.length
    return 1 - distance(a, b) / l
}

const closest = (test, words) => {
    let r = 0;
    for (const word of words) {
        const s = similarity(test, word)
        console.log(test, "<->", word, "=", s)
        if (s > r) {
            r = s
        }
    }
    return r
}

const compare = (words, tests) => {
    let a = 0;
    let h = 1;
    for (const test of tests) {
        const x = closest(test, words)
        a += x
        h += 1 / x
    }
    return (a / tests.length + tests.length / h) / 2
}

module.exports = { similarity, closest, compare }
