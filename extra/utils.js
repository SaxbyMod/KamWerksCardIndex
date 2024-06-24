const devMode = false
function debugLog(...str) {
    if (devMode) console.log(...str)
}

function infoLog(...str) {
    if (!devMode) console.log(...str)
}

const randInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const randomChoice = (list) => {
    return list[Math.floor(Math.random() * list.length)]
}

const randomChoices = (list, num) => {
    let out = []
    let already = []
    for (let choice = 0; choice < num; choice++) {
        let n
        while (true) {
            n = Math.floor(Math.random() * list.length)
            if (already.includes(n)) continue
            break
        }
        out.push(list[n])
        already.push(n)
        if (list.length <= already.length) return out
    }
    return out
}

const drawList = (list, num) => {
    let out = []
    for (let choice = 0; choice < num; choice++) {
        if (list.length < 1) return out
        let e = Math.floor(Math.random() * list.length)
        out.push(list[e])
        list.splice(e, 1)
    }
    return out
}

const shuffleList = (list) => {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
    }
    return list
}

const countDup = (list) => {
    const listNoDup = new Set(list)
    let out = {}
    for (const i of listNoDup) {
        out[i] = list.filter((c) => c.toLowerCase() === i.toLowerCase()).length
    }
    return out
}

const listDiff = (list1, list2) => list1.filter((x) => !list2.includes(x))
const listInter = (list1, list2) => list1.filter((x) => list2.includes(x))

const isPerm = (interaction) =>
    interaction.member.roles.cache.some(
        (role) =>
            role.id == "994578531671609426" || role.id == "1028537837169156156" || role.id == "1111314861226459180"
    ) || interaction.user.id == "601821309881810973"

const getMessage = async (channel, id) => {
    return await channel.messages.fetch(id)
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

//stackoverflow.com/questions/67720548/generate-unique-combinations-in-javascript-from-n-objects-with-r-samples
function combinations(a, c) {
    let index = []
    let n = a.length

    for (let j = 0; j < c; j++) index[j] = j
    index[c] = n

    let ok = true
    let result = []

    while (ok) {
        let comb = []
        for (let j = 0; j < c; j++) comb[j] = a[index[j]]
        result.push(comb)

        ok = false

        for (let j = c; j > 0; j--) {
            if (index[j - 1] < index[j] - 1) {
                index[j - 1]++
                for (let k = j; k < c; k++) index[k] = index[k - 1] + 1
                ok = true
                break
            }
        }
    }

    return result
}

function toPercent(num) {
    return (num * 100).toFixed(1)
}

function average(...numList) {
    return numList.reduce((acc, val) => acc + val, 0) / numList.length
}

function getBone(c) {
    let out = c.bone_cost ?? 0
    if (out == 0) return out
    const sigilModifier = {
        "Fecundity (Kaycee)": { type: "mul", value: 2 },
        "Unkillable (Eternal)": { type: "mul", value: 2 },
        Unkillable: { type: "overload" },
    }
    if ((c.sigils ?? []).length < 1) return out
    for (const sigil of c.sigils) {
        if (!Object.keys(sigilModifier).includes(sigil)) continue
        const obj = sigilModifier[sigil]
        if (obj.type == "overload") return Infinity
        let op = ""
        if (obj.type == "mul") {
            op = "*"
        } else if (obj.type == "add") {
            op = "+"
        }
        out = eval(`out${op}${obj.value}`)
    }
    return out
}

function getBlood(c) {
    let notC = JSON.parse(JSON.stringify(c))
    notC.bone_cost = c.blood_cost ?? 0
    if ((c.sigils ?? []).includes("Ant Spawner")) notC.bone_cost++
    let out = getBone(notC)
    return out
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function randStr(len = 7) {
    return (Math.random() + 1).toString(36).slice(2, 2 + len)
}

module.exports = {
    debugLog,
    infoLog,
    randInt,
    randomChoice,
    randomChoices,
    drawList,
    shuffleList,
    countDup,
    listDiff,
    listInter,
    isPerm,
    getMessage,
    clamp,
    sleep,
    combinations,
    toPercent,
    average,
    getBone,
    getBlood,
    deepCopy,
    randStr,
}
