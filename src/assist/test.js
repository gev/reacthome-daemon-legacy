const Fuse = require("fuse.js")

const data = [
    {
        id: 1,
        title: ["лампа"]
    },
    {
        id: 2,
        title: ["лампус"]
    },
    {
        id: 3,
        title: ["лампусик"]
    },
    {
        id: 4,
        title: ["лампусикус"]
    },
    {
        id: 5,
        title: ["красная", "лампа"]
    },
    {
        id: 6,
        title: ["зеленая", "лампа"]
    },
    {
        id: 7,
        title: ["синяя", "лампа"]
    },
]

const makeIndex = (data, keys) => new Fuse(data, {
    keys,
    threshold: 1,
    includeScore: true,
    isCaseSensitive: false,
    minMatchCharLength: 3,
    shouldSort: true,

})

const index = makeIndex(data, ['title'])

const tests = [
    ["красный", "лампус"],
    ["лампус", "красный"],
    ["красный"],
    ["красный", "лампусик"],
    ["красный", "лампусикус"],
    ["лампа"],
]


const search = keywords => {
    const items = new Map()

    for (const keyword of keywords) {
        for (const { item, score } of index.search(keyword)) {
            const s = score > 0.001 ? score : 0.001
            if (items.has(item.id)) {
                items.get(item.id).score *= s
            } else {
                items.set(item.id, { ...item, score: s })
            }
        }
    }


    return [...items.values()].sort((a, b) => a.score - b.score)

}

for (const keywords of tests) {
    console.log(keywords)
    console.log(search(keywords))
}
