const { distance } = require("fastest-levenshtein")



const similarity = (a, b) => {
    const l = a.length > b.length ? a.length : b.length
    return 1 - distance(a, b) / l
}

const closest = (test, words) => {
    let r = 0;
    for (const word of words) {
        const s = similarity(test, word)
        if (s > r) {
            r = s
        }
    }
    return r
}



module.exports = { similarity, closest }
