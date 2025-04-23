const { distance } = require("fastest-levenshtein")

const subjects = ["л", "лампа", "лампус", "лампусик", "лампусикус", "красная лампа", "зеленая лампа", "синяя лампа"]


const tests = ["л", "лампа", "лампус красный", "красный", "красный лампусик", "красный лампусикус", "лампа зеленая"]

const compare = (a, b) => {
    const l = a.length > b.length ? a.length : b.length
    return 1 - distance(a, b) / l
}

for (const test of tests) {
    for (const subject of subjects) {
        console.log(
            test,
            "<->",
            subject,
            "=",
            compare(test, subject),
        )
    }
}
