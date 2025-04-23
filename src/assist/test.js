const { compare } = require("./levenshtein")

const subjects = [
    "л",
    "лампа",
    "лампус",
    "лампусик",
    "лампусикус",
    "красная лампа",
    "зеленая лампа",
    "синяя лампа",
]


const tests = [
    "л",
    "лампа",
    "лампус красный",
    "красный",
    "красный лампусик",
    "красный лампусикус",
    "лампа зеленая",
    "лампу",
]

for (const test of tests) {
    for (const subject of subjects) {
        console.log(
            test,
            "<->",
            subject,
            "=",
            compare(test.split(" "), subject.split(" ")),
        )
        console.log()
    }
}
