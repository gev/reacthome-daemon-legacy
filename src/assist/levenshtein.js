const { distance } = require("fastest-levenshtein")



const similarity = (a, b) => {
    const l = a.length > b.length ? a.length : b.length
    const d = distance(a, b)
    const s = 1 - d / l
    return { distance: d, similarity: s }
}

const closest = (test, words) => {
    let res = { distance: 1000, similarity: 0 };
    for (const word of words) {
        const s = similarity(test, word)
        if (s.distance < res.distance) {
            res = s
        }
    }
    return res
}



module.exports = { similarity, closest }
