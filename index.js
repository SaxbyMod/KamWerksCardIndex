// import hell
const {
    Client,
    GatewayIntentBits,
    Events,
    EmbedBuilder,
    Colors,
    AttachmentBuilder,
    Partials,
    ActionRowBuilder,
    ComponentType,
    StringSelectMenuBuilder,
    ButtonStyle,
    TextInputBuilder,
    ModalBuilder,
    TextInputStyle,
    MessageFlags,
    ButtonBuilder,
} = require("discord.js")

// installed module
const StringSimilarity = require("string-similarity")
const scryfall = require("scryfall")
const chalk = require("chalk")
const Canvas = require("@napi-rs/canvas")
const format = require("string-format")
const { create, all } = require("mathjs")

const mathjs = create(all)
const mathSafe = create(all)

mathSafe.createUnit("blahaj", "55 cm", { prefixes: "long" })
mathSafe.createUnit("longhaj", "1 m", { prefixes: "long" })

const limitedEvaluate = mathSafe.evaluate

mathSafe.import(
    {
        import: function () {
            throw new Error("Function import is disabled")
        },
        createUnit: function () {
            throw new Error("Function createUnit is disabled")
        },
        evaluate: function () {
            throw new Error("Function evaluate is disabled")
        },
        parse: function () {
            throw new Error("Function parse is disabled")
        },
        simplify: function () {
            throw new Error("Function simplify is disabled")
        },
        derivative: function () {
            throw new Error("Function derivative is disabled")
        },
    },
    { override: true }
)

// general module (don't need installing)
const fetch = require("node-fetch")
const http = require("http")
const fs = require("fs")

// my module
const { token, clientId } = require("./config.json")
const {
    debugLog,
    infoLog,
    randInt,
    randomChoice,
    randomChoices,
    drawList,
    shuffleList,
    countDup,
    listDiff,
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
} = require("./extra/utils")

const portraitCaches = require("./extra/caches.json")

format.extend(String.prototype, {})

const searchRegex = /([^\s]*?)(\w{3})?\[{2}([^\]]+)\]{2}/g
const queryRegex = /(-|)(\w+):\s?([^"\s]+|"[^"]+")/g

const matchPercentage = 0.4
let scream = false
let log = ""
let doneSetup = false
// Chalk color
chalk.orange = chalk.hex("#fb922b")
chalk.pink = chalk.hex("#ff80a4")

const colorList = ["blue", "cyan", "green", "yellow", "orange", "red", "pink", "magenta"]

//set up the bot client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Message],
})

//SECTION - Define set stuff

//ANCHOR - Set config constant

//define how card should be render
const SetFormatList = {
    imf: {
        color: {
            "card.rare": Colors.Green,
        },
        title: [
            { text: "{name}", type: "sub" },
            { text: " ({set}) ", type: "set" },
            { text: ":conductive:", type: "con", condition: "card.conduit" },
            { text: ":rare:", type: "con", condition: "card.rare" },
            { text: ":unsacable:", type: "con", condition: "card.nosac" },
            {
                text: ":unhammerable:",
                type: "con",
                condition: "card.unhammerable",
            },
            { text: ":banned:", type: "con", condition: "card.banned" },
        ],
        body: {
            general: {
                type: "general",
                info: [
                    { text: "*{description}*\n", type: "sub" },
                    {
                        text: `\n**Blood Cost**: :{blood_cost}::x_::blood:`,
                        type: "sub",
                    },
                    {
                        text: "\n**Bone Cost**: :{bone_cost}::x_::bone:",
                        type: "sub",
                    },
                    {
                        text: "\n**Energy Cost**: :{energy_cost}::x_::energy:",
                        type: "sub",
                    },
                    { text: "\n**Mox Cost**: {mox_cost}", type: "mox" },
                    { text: "\n{health}", type: "stat" },
                ],
            },
            sigil: {
                type: "keyword",
                name: "== SIGILS ==",
                var: "sigils",
            },
            extra: {
                type: "extra",
                name: "== EXTRA INFO ==",
                info: [
                    { text: "**Change into**: {evolution}\n", type: "sub" },
                    { text: "**Shed**: {sheds}\n", type: "sub" },
                    {
                        text: "**This card split into**: {left_half} (Left), {right_half} (Right)\n",
                        type: "sub",
                    },
                ],
            },
        },
    },
    imfCompact: {
        color: {
            "card.rare": Colors.Green,
        },
        title: [
            { text: "{name}", type: "sub" },
            { text: " ({set}) ", type: "set" },
            { text: ":conductive:", type: "con", condition: "card.conduit" },
            { text: ":unsacable:", type: "con", condition: "card.unsacable" },
            { text: ":unhammerable:", type: "con", condition: "card.unhammerable" },
            { text: ":banned:", type: "con", condition: "card.banned" },
        ],
        body: {
            general: {
                type: "general",
                info: [
                    {
                        text: `:{blood_cost}::blood: `,
                        type: "sub",
                    },
                    {
                        text: ":{bone_cost}::bone: ",
                        type: "sub",
                    },
                    {
                        text: ":{energy_cost}::energy: ",
                        type: "sub",
                    },
                    { text: "{mox_cost}", type: "mox" },
                    { text: "\n{health}", type: "stat" },
                    { text: "\n**Sigils**: {sigils}\n", type: "list" },
                    { text: "**Change into**: {evolution}\n", type: "sub" },
                    { text: "**Shed**: {sheds}\n", type: "sub" },
                    {
                        text: "**This card split into**: {left_half} (Left), {right_half} (Right)",
                        type: "sub",
                    },
                ],
            },
        },
    },
    imfDraft: [
        { text: "**{name} ", type: "sub" },
        { text: "[RARE] ", type: "con", con: "card.rare" },
        { text: "(", type: "normal" },
        { text: "{blood_cost} Blood", type: "sub" },
        { text: "{bone_cost} Bone", type: "sub" },
        { text: "{energy_cost} Energy", type: "sub" },
        { text: "{mox_cost}", type: "mox" },
        { text: ")**\n", type: "normal" },
        {
            text: "Stat: {s}\n",
            type: "stat",
            attackVar: "attack",
            healthVar: "health",
        },
        { text: "Sigils: {s}", type: "list", var: "sigils" },
    ],
    augmented: {
        color: {
            'card.temple == "Beast"': Colors.DarkGold,
            'card.temple == "Undead"': Colors.Green,
            'card.temple == "Tech"': Colors.Blue,
            'card.temple == "Magick"': Colors.Fuchsia,
        },
        title: [
            { text: "{name}", type: "sub" },
        ],
        body: {
            general: {
                type: "general",
                info: [
                    { text: "*{description}*\n", type: "sub" },
                    { text: "**Temple**: {temple}\n", type: "sub" },
                    { text: "**Tier**: {tier}\n", type: "sub" },
                    { text: "**Tribes**: {tribes}\n", type: "sub" },
                    {
                        text: "\n**Blood Cost**: :{blood}::x_::blood:",
                        type: "sub",
                    },
                    {
                        text: "\n**Bone Cost**: :{bone}::x_::bones:",
                        type: "sub",
                    },
                    {
                        text: "\n**Skull Cost**: :{skull}::x_::skull:",
                        type: "sub",
                    },
                    {
                        text: "\n**Energy Cost**: :{energy}::x_::energy:",
                        type: "sub",
                    },
                    { text: "\n**Mox Cost**: {mox}", type: "mox" },
                    {
                        text: "\n**Shattered Mox Cost**: {shattered}",
                        type: "mox",
                    },
                    { text: "\n{health}", type: "stat" },
                ],
            },
            sigil: {
                type: "keyword",
                name: "== SIGILS ==",
                var: "sigils",
            },
            trait: { type: "keyword", name: "== TRAITS ==", var: "traits" },
            extra: {
                type: "extra",
                name: "== EXTRA INFO ==",
                info: [{ text: "**Token**: {token}", type: "sub" },
                    { text: "\nThis card's format is: {format}", type: "sub"},
                    { text: "\n\nThis card was provided by the Inscryption PvP wiki found [here.]({wikipage} '{name}')", type: "sub"},
                ],
            },
        },
    },
    augmentedCompact: {
        color: {
            'card.temple == "Beast"': Colors.DarkGold,
            'card.temple == "Undead"': Colors.Green,
            'card.temple == "Tech"': Colors.Blue,
            'card.temple == "Magick"': Colors.Fuchsia,
        },
        title: [
            { text: "{name}", type: "sub" },
        ],
        body: {
            general: {
                type: "general",
                info: [
                    { text: "{tribes} {tier}\n", type: "sub" },

                    { text: ":{blood}::blood: ", type: "sub" },
                    { text: ":{bone}::bones:", type: "sub" },
                    { text: ":{skull}::skulls:", type: "sub" },
                    {
                        text: ":{energy}::energy: ",
                        type: "sub",
                    },
                    { text: "{mox} ", type: "mox" },
                    { text: "{shattered}", type: "mox" },
                    { text: "\n{health}", type: "stat" },
                    { text: "\n**Sigils**: {sigils}", type: "list" },
                    { text: "\n**Traits**: {traits}", type: "list" },
                    { text: "\n**Token**: {token}", type: "sub" },
                    { text: "\nThis card's format is: {format}", type: "sub"},
                    { text: "\n\nThis card was provided by the Inscryption PvP wiki found [here.]({wikipage} '{name}')", type: "sub"},
                ],
            },
        },
    },
    augmentedDraft: [
        { text: "**{name} ", type: "sub" },
        { text: "[{tier}] ", type: "sub" },
        { text: "(", type: "normal" },
        { text: "{blood} Blood", type: "sub" },
        { text: "{bone} Bone", type: "sub" },
        { text: "{energy} Energy", type: "sub" },
        { text: "{mox}", type: "mox" },
        { text: "{shattered}", type: "mox" },
        { text: ")** | ", type: "normal" },
        {
            text: "Stat: {s} | ",
            type: "stat",
            attackVar: "attack",
            healthVar: "health",
        },
        { text: "Sigils: {s}", type: "list", var: "sigils" },
        { text: "Traits: {s}", type: "list", var: "traits" },
    ],
    redux: {
        color: {
            "card.rare": Colors.Green,
        },
        title: [
            { text: "{name}", type: "sub" },
            { text: "({set}) ", type: "set" },
            { text: ":conductive:", type: "con", condition: "card.conduit" },
            { text: ":rare:", type: "con", condition: "card.rare" },
            { text: ":unsacable:", type: "con", condition: "card.unsacable" },
            {
                text: ":unhammerable:",
                type: "con",
                condition: "card.unhammerable",
            },
            { text: ":banned:", type: "con", condition: "card.banned" },
        ],
        body: {
            general: {
                type: "general",
                info: [
                    { text: "*{description}*\n", type: "sub" },
                    {
                        text: `\n**Blood Cost**: :{blood_cost}::x_::blood:`,
                        type: "sub",
                    },
                    {
                        text: `\n**Sap Cost**: :{sap_cost}::x_::sap:`,
                        type: "sub",
                    },
                    {
                        text: "\n**Bone Cost**: :{bone_cost}::x_::bone:",
                        type: "sub",
                    },
                    {
                        text: "\n**Energy Cost**: :{energy_cost}::x_::energy:",
                        type: "sub",
                    },
                    {
                        text: "\n**Cell Cost**: :{cell_cost}::x_::cell:",
                        type: "sub",
                    },
                    {
                        text: "\n**Heat Cost**: :{heat_cost}::x_::heat:",
                        type: "sub",
                    },
                    { text: "\n**Mox Cost**: {mox_cost}", type: "mox" },
                    { text: "\n{health}", type: "stat" },
                ],
            },
            sigil: {
                type: "special_keyword",
                name: "== SIGILS ==",
                var: "sigils",
            },
        },
    },
}

// imf pool
const ImfPool = [
    { name: "ban", condition: "card.banned" },
    { name: "rare", condition: "card.rare" },
    { name: "beast", condition: "card.blood_cost" },
    { name: "undead", condition: "card.bone_cost" },
    { name: "tech", condition: "card.energy_cost" },
    {
        name: "magick",
        condition: "card.mox_cost || specialMagick.includes(card.name)",
    },
    { name: "common", condition: "!card.rare" },
]

//structure of a pack for drafting
const PackStructure = {
    imf: [
        { type: "rare", amount: 1, replacement: "common" },
        { type: "common", amount: 4 },
        { type: "ban", amount: 0 },
    ],
    augmented: [
        { type: "talk", amount: 1, replacement: "rare" },
        { type: "rare", amount: 1, replacement: "uncommon" },
        { type: "uncommon", amount: 2 },
        { type: "common", amount: 5 },
    ],
}

//deck restriction when drafting
const DraftRestriction = {
    imf: {
        rare: { copyPerDeck: 1, uniquePerDeck: Infinity },
        common: { copyPerDeck: 3, uniquePerDeck: Infinity },
    },
    eternal: {
        rare: { copyPerDeck: 1, uniquePerDeck: Infinity },
        common: { copyPerDeck: 3, uniquePerDeck: Infinity },
    },
    augmented: {
        common: { copyPerDeck: 3, uniquePerDeck: Infinity },
        uncommon: { copyPerDeck: 3, uniquePerDeck: Infinity },
        rare: { copyPerDeck: 1, uniquePerDeck: 3 },
        talk: { copyPerDeck: 1, uniquePerDeck: 1 },
    },
}

//ANCHOR - Set config
const SetList = {
    //imf set
    van: {
        name: "vanilla",
        type: "107",
        format: SetFormatList.imf,
        compactFormat: SetFormatList.imfCompact,
        pools: ImfPool,
        packStructure: PackStructure.imf,
        draftFormat: SetFormatList.imfDraft,
        draftRestriction: DraftRestriction.imf,
    },
    com: {
        name: "standard",
        type: "107",
        format: SetFormatList.imf,
        compactFormat: SetFormatList.imfCompact,
        pools: ImfPool,
        packStructure: PackStructure.imf,
        draftFormat: SetFormatList.imfDraft,
        draftRestriction: DraftRestriction.imf,
    },
    ete: {
        name: "eternal",
        type: "url",
        url: "https://raw.githubusercontent.com/EternalHours/EternalFormat/main/IMF_Eternal.json",
        format: SetFormatList.imf,
        compactFormat: SetFormatList.imfCompact,
        pools: ImfPool,
        packStructure: PackStructure.imf,
        draftFormat: SetFormatList.imfDraft,
        draftRestriction: DraftRestriction.eternal,
    },
    egg: {
        name: "mr.egg",
        type: "url",
        url: "https://raw.githubusercontent.com/senor-huevo/Mr.Egg-s-Goofy/main/Mr.Egg's%20Goofy.json",
        format: SetFormatList.imf,
        compactFormat: SetFormatList.imfCompact,
        pools: ImfPool,
        packStructure: PackStructure.imf,
        draftFormat: SetFormatList.imfDraft,
        draftRestriction: DraftRestriction.imf,
    },

    //special load set
    aug: {
        name: "augmented",
        type: "specialLoad",
        format: SetFormatList.augmented,
        compactFormat: SetFormatList.augmentedCompact,
        file: "./extra/augmentedProcess.js",
        pools: [
            { name: "common", condition: 'card.tier == "Common"' },
            { name: "uncommon", condition: 'card.tier == "Uncommon"' },
            { name: "rare", condition: 'card.tier == "Rare"' },
            { name: "talk", condition: 'card.tier == "Talking"' },
            { name: "side", condition: 'card.tier == "Side Deck"' },
            { name: "art", condition: 'card.art == "Done"' },
        ],
        packStructure: PackStructure.augmented,
        draftFormat: SetFormatList.augmentedDraft,
        draftRestriction: DraftRestriction.augmented,
    },
    red: {
        name: "redux",
        type: "specialLoad",
        format: SetFormatList.redux,
        compactFormat: SetFormatList.redux,
        file: "./extra/reduxProcess.js",
        pools: ImfPool,
    },
    cti: {
        name: "custom tcg inscryption",
        type: "specialLoad",
        format: SetFormatList.augmented,
        compactFormat: SetFormatList.augmentedCompact,
        file: "./extra/CustomTCGInscryptionProcesser.js",
        pools: [
            { name: "common", condition: 'card.tier == "Common"' },
            { name: "uncommon", condition: 'card.tier == "Uncommon"' },
            { name: "rare", condition: 'card.tier == "Rare"' },
            { name: "talk", condition: 'card.tier == "Talking"' },
            { name: "side", condition: 'card.tier == "Side Deck"' },
            { name: "joke", condition: `card.tier == "Common (Joke Card)"` },
            { name: "banned", condition: `card.temple == "Terrain/Extras"` },
        ],
    },
    dmc: {
        name: "desafts mod (CTI)",
        type: "specialLoad",
        format: SetFormatList.augmented,
        compactFormat: SetFormatList.augmentedCompact,
        file: "./extra/DesaftsModCTIProcesser.js",
        pools: [
            { name: "common", condition: 'card.tier == "Common"' },
            { name: "uncommon", condition: 'card.tier == "Uncommon"' },
            { name: "rare", condition: 'card.tier == "Rare"' },
            { name: "talk", condition: 'card.tier == "Talking"' },
            { name: "side", condition: 'card.tier == "Side Deck"' },
            { name: "joke", condition: `card.tier == "Common (Joke Card)"` },
            { name: "banned", condition: `card.temple == "Terrain/Extras"` },
        ],
    },

    //file set
    bas: {
        name: "base",
        type: "file",
        file: "./extra/vanilla.json",
        format: SetFormatList.imf,
        compactFormat: SetFormatList.imfCompact,
        pools: ImfPool,
    },

    // special set
    m: { name: "magic the gathering", type: "special" },

    // modifier
    o: { name: "original version", type: "modifier" },
    c: { name: "compact", type: "modifier" },
    p: { name: "no portrait", type: "modifier" },
    s: { name: "sigil", type: "modifier" },
    "`": { name: "no search", type: "modifier" },
    q: { name: "query", type: "modifier" },
    j: { name: "json", type: "modifier" },
    "?": { name: "lazy", type: "modifier" },
    $: { name: "exact", type: "modifier" },
    d: { name: "dumb", type: "modifier" },
    f: { name: "full card", type: "modifier" },
}

//!SECTION - define the ruleset shit

const serverDefaultSet = require("./extra/default.json")

let setsData = {}

const specialMagick = [
    "Mox Module",
    "Bleene's Mox",
    "Goranj's Mox",
    "Orlu's Mox",
    "Mage Pupil",
    "Skelemagus",
    "Gem Detonator",
    "Gem Guardian",
    "Horse Mage",
] // these card will be consider magick no matter what

//downloading all the set and fetch important shit
infoLog(chalk.magenta.underline.bold("Setup please wait"))
;(async () => {
    const startSetup = performance.now()
    infoLog(chalk.magenta.underline.bold("Loading set data..."))
    let i = 0
    //fetch all the set json
    for (const set of Object.values(SetList)) {
        const start = performance.now()
        if (set.type === "107") {
            await fetch(`https://raw.githubusercontent.com/107zxz/inscr-onln-ruleset/main/${set.name}.json`)
                .then((res) => res.json())
                .then((json) => {
                    setsData[set.name] = json
                })
        } else if (set.type == "file") {
            setsData[set.name] = require(set.file)
        } else if (set.type == "specialLoad") {
            setsData[set.name] = await require(set.file).load()
        } else if (set.type == "url") {
            try {
                await fetch(set.url)
                    .then((res) => res.json())
                    .then((json) => {
                        setsData[set.name] = json
                    })
            } catch (err) {
                infoLog(chalk.bgRed(`Set ${set.name} have a json error loading standard data instead!`))
                if (set.name != "eternal") continue
                console.log(err)
                scream = true
                log = err
                setsData[set.name] = JSON.parse(JSON.stringify(setsData["standard"]))
            }
        }
        const cardCount = setsData[set.name]
            ? typeof setsData[set.name].cards == "object"
                ? Object.keys(setsData[set.name].cards).length
                : setsData[set.name].cards.length
            : 0

        // Prettier make it look weird
        // Set [set name] loaded with [set code] and [card count] cards (load times: [time]ms)

        infoLog(
            chalk.blue(
                `Set ${chalk[colorList[i % colorList.length]].inverse(
                    set.name
                )} loaded with set code "${chalk.orange.bold(
                    Object.keys(SetList).find((key) => SetList[key] === set)
                )}"${
                    setsData[set.name]
                        ? ` and ${chalk[cardCount > 300 ? "red" : cardCount > 100 ? "yellow" : "green"](
                              cardCount
                          )} cards`
                        : ""
                } (${chalk.red(`load times: ${(performance.now() - start).toFixed(1)} ms`)})`
            )
        )
        i++
    }
    infoLog(chalk.red(`Loading set data took: ${(performance.now() - startSetup).toFixed(1)}ms`))
    // loading all the card pool
    infoLog(chalk.magenta.underline.bold("Loading card pools..."))
    for (const setName of Object.keys(setsData)) {
        const start = performance.now()
        if (Object.values(SetList).find((i) => i.name == setName).type == "file") continue
        setsData[setName].pools = {}
        let temp = {}
        for (const card of setsData[setName].cards) {
            const name = card.name.toLowerCase()
            temp[name] = card

            for (const poolType of Object.values(SetList).find((i) => i.name == setName).pools) {
                if (!setsData[setName].pools[poolType.name]) setsData[setName].pools[poolType.name] = []
                if (eval(poolType.condition)) setsData[setName].pools[poolType.name].push(name)
            }
        }
        setsData[setName].cards = temp
        // Finish loading [set name] pools. Loaded [all pool amount and percentage] cards. Pool names: [pool]
        infoLog(
            chalk.green(
                `${setName} loaded with ${chalk.blue(
                    Object.keys(setsData[setName].pools).length
                )} pools with ${Object.entries(setsData[setName].pools)
                    .map(([pn, pv], i) =>
                        chalk[colorList[i]](
                            `${pv.length} (${pn}, ${(
                                (pv.length / Object.keys(setsData[setName].cards).length) *
                                100
                            ).toFixed(1)}%)`
                        )
                    )
                    .join(", ")} cards.(${chalk.red(`load times: ${(performance.now() - start).toFixed(1)}ms`)})`
            )
        )
    }
    infoLog(chalk.red(`Setup took: ${(performance.now() - startSetup).toFixed(1)}ms`))
    for (const [key, value] of Object.entries(process.memoryUsage())) {
        infoLog(chalk.orange(`Memory usage by ${key}, ${(value / 1000000).toFixed(1)}MB `))
    }
    infoLog(
        chalk.orange(
            `Total memory use: ${(
                Object.values(process.memoryUsage()).reduce((acc, c) => acc + c, 0) / 1000000
            ).toFixed(1)}MB`
        )
    )

    infoLog(chalk.green(`Loaded ${Object.values(portraitCaches).length} caches`))
    debugLog("Setup completed")

    doneSetup = true
    if (!client.isReady()) return
    console.log(chalk.bgGreen.black("Setup is complete and bot is connected to Discord's sever"))
    const servers = Array.from(client.guilds.cache).map((s) => s[1].name)
    infoLog(chalk.cyan(`Bot is in ${servers.length} server`))
    infoLog(chalk.cyan(`Servers: ${servers.map((s, i) => chalk[colorList[i % colorList.length]](s)).join(", ")}`))
})()

const specialAttackDescription = {
    green_mox: 'This card\'s power is the number of creatures you control that have the sigil "Green Mox"',
    mox: "This card's power is the number of moxes you control",
    mirror: "This card's power is the power of the opposing creature",
    ant: "This card's power is number of ant you control.",
    bell: "This card's power is how close it is to the bell",
    hand: "This card's power is the number of the cards in your hand",
}

const queryKeywordList = {
    sigil: {
        alias: ["s"],
        description: "Filter for a sigils",
        callback: (value, _, filterPossibleValue) => {
            filterPossibleValue(([_, info]) =>
                info.sigils
                    ? StringSimilarity.findBestMatch(
                          value,
                          info.sigils.map((s) => s.toLowerCase())
                      ).bestMatch.rating >= 0.8
                    : false
            )
            return `{n} have ${value}`
        },
    },
    effect: {
        alias: ["e"],
        description: "Filter for a sigil effect",
        callback: (value, set, filterPossibleValue) => {
            filterPossibleValue(([_, info]) => {
                if (!info.sigils) return false
                let flag = false
                info.sigils.forEach((sigil) => {
                    if (setsData[set.name].sigils[sigil].includes(value)) flag = true
                })
                return flag
            })
            return `have sigil effect {n} includes "${value}"`
        },
    },
    description: {
        alias: ["d"],
        description: "Filter for a description",
        callback: (value, _, filterPossibleValue) => {
            filterPossibleValue(([_, info]) => {
                if (!info.description) return false
                return info.description.includes(value)
            })
            return `have description {n} includes "${value}"`
        },
    },
    resourcecost: {
        alias: ["rc"],
        description: "Filter for resource cost (rc). Can compare with numeric expression (`>`,`>=`, etc.)",
        callback: (value, _, filterPossibleValue) => {
            const op = value.includes(">=")
                ? ">="
                : value.includes("<=")
                ? "<="
                : value.includes(">")
                ? ">"
                : value.includes("<")
                ? "<"
                : "=="
            value = value.replaceAll("<", "").replaceAll(">", "").replaceAll("=", "")
            filterPossibleValue(
                ([_, info]) =>
                    eval(`${info.blood_cost}${op}${value}`) ||
                    eval(`${info.bone_cost}${op}${value}`) ||
                    eval(`${info.energy_cost}${op}${value}`) ||
                    eval(`${info.mox ? info["mox"].length : undefined}${op}${value}`) ||
                    eval(`${info.shattered ? info.shattered.length : undefined}${op}${value}`)
            )

            return `with rc {n} ${op}${value}`
        },
    },
    convertedresourcecost: {
        alias: ["crc"],
        description: "Filter for converted resource cost (crc). Can compare with numeric expression (`>`,`>=`, etc.)",
        callback: (value, set, filterPossibleValue) => {
            const op = value.includes(">=")
                ? ">="
                : value.includes("<=")
                ? "<="
                : value.includes(">")
                ? ">"
                : value.includes("<")
                ? "<"
                : "=="
            value = value.replaceAll("<", "").replaceAll(">", "").replaceAll("=", "")
            filterPossibleValue(([_, info]) =>
                eval(
                    `${
                        (info.blood_cost ? info.blood_cost : 0) +
                        (info.bone_cost ? info.bone_cost : 0) +
                        (info.energy_cost ? info.energy_cost : 0) +
                        (info.mox_cost || info.mox ? info[set.name == "augmeted" ? "mox" : "mox_cost"].length : 0) +
                        (info.shattered ? info.shattered.length : 0)
                    }${op}${value}`
                )
            )

            return `with crc {n} ${op}${value}`
        },
    },
    resourcetype: {
        alias: ["rt"],
        description:
            "Filter for resource type. Possible resource: base game resource  (`blood`, `bone`, etc.) and custom resource (`shattered`) and first character of resource name (`o` for bone instead)",
        callback: (value, set, filterPossibleValue) => {
            const type =
                value == "b" || value == "blood"
                    ? set.name == "augmented"
                        ? "blood"
                        : "blood_cost"
                    : value == "o" || value == "bone"
                    ? set.name == "augmented"
                        ? "bone"
                        : "bone_cost"
                    : value == "e" || value == "energy"
                    ? set.name == "augmented"
                        ? "energy"
                        : "energy_cost"
                    : value == "m" || value == "mox"
                    ? set.name == "augmented"
                        ? "mox"
                        : "mox_cost"
                    : value == "s" || value == "shattered"
                    ? "shattered"
                    : ""
            filterPossibleValue(([_, info]) => info[type])

            return `{n} cost ${
                value == "b" || value == "blood"
                    ? "blood"
                    : value == "o" || value == "bone"
                    ? "bone"
                    : value == "e" || value == "energy"
                    ? "energy"
                    : value == "m" || value == "mox"
                    ? "mox"
                    : value == "s" || value == "shattered"
                    ? "shattered"
                    : ""
            }`
        },
    },
    color: {
        alias: ["c"],
        description:
            "Filter for mox color. Possible color: base game mox color (`green`, `orange`, etc.), custom color (`colorless`), base game gem name (`emerald`, `ruby`, etc.) custom gem name (`prism`), and first character of color name",
        callback: (value, set, filterPossibleValue) => {
            const color =
                value == "g" || value == "green" || value == "e" || value == "emerald"
                    ? set.name == "augmented"
                        ? "emerald"
                        : "Green"
                    : value == "o" || value == "orange" || value == "r" || value == "ruby"
                    ? set.name == "augmented"
                        ? "ruby"
                        : "Orange"
                    : value == "b" || value == "blue" || value == "s" || value == "sapphire"
                    ? set.name == "augmented"
                        ? "sapphire"
                        : "Blue"
                    : value == "c" || value == "colorless" || value == "p" || value == "prism"
                    ? "prism"
                    : ""

            // if mox cost exist check for color then if shattered exist also check for color
            // or between mox and shattered
            filterPossibleValue(([_, info]) =>
                info.mox || info.mox_cost
                    ? info[set.name == "augmented" ? "mox" : "mox_cost"].includes(color)
                    : false || info.shattered
                    ? info.shattered.includes(`shattered_${color}`)
                    : false
            )

            return `is {n} ${color}`
        },
    },
    temple: {
        alias: ["t"],
        description: "Filter for temple. Possible temple: base game temple (`beast`, `undead`, etc.)",
        callback: (value, _, filterPossibleValue) => {
            const temple =
                value == "b" || value == "beast"
                    ? "Beast"
                    : value == "u" || value == "undead"
                    ? "Undead"
                    : value == "t" || value == "technology" || value == "tech"
                    ? "Tech"
                    : value == "m" || value == "magick"
                    ? "Magick"
                    : ""
            filterPossibleValue(([_, info]) => info.temple == temple)

            return `{n} from ${temple} temple`
        },
    },
    tribe: {
        alias: ["tb"],
        description: "Filter for tribe.",
        callback: (value, _, filterPossibleValue) => {
            filterPossibleValue(([_, info]) => {
                if (!info.tribes) return false
                if (Array.isArray(info.tribes)) info.tribes = info.tribes.join(" ")
                return info.tribes.toLowerCase().includes(value)
            })

            return `is {n} ${value}`
        },
    },
    trait: {
        alias: ["tr"],
        description: "Filter for trait.",
        callback: (value, _, filterPossibleValue) => {
            filterPossibleValue(([_, info]) => {
                if (!info.traits) return false
                return info.traits.map((t) => t.toLowerCase()).includes(value)
            })

            return `{n} have ${value}`
        },
    },
    rarity: {
        alias: ["r"],
        description:
            "Filter for rarity/tier. Possible rarity: Possible value: base game rarity  (`common`, `rare`), custom rarity (`uncommon`, `talk`, `side`, etc.) first character of rarity. (`c`, `u`, etc.)",
        callback: (value, set, filterPossibleValue) => {
            const rarity =
                value == "c" || value == "common"
                    ? set.name == "augmented"
                        ? "Common"
                        : false
                    : value == "u" || value == "uncommon"
                    ? "Uncommon"
                    : value == "r" || value == "rare"
                    ? set.name == "augmented"
                        ? "Rare"
                        : true
                    : value == "t" || value == "talk"
                    ? "Talking"
                    : value == "s" || value == "side"
                    ? "Side Deck"
                    : ""
            filterPossibleValue(([_, info]) =>
                set.name == "augmented" ? info.tier == rarity : rarity ? info.rare : !info.rare
            )

            return `is {n} ${rarity}`
        },
    },
    health: {
        alias: ["h"],
        description: "Filter for health. Can compare with numeric expression (`>`,`>=`, etc.)",
        callback: (value, _, filterPossibleValue) => {
            const op = value.includes(">=")
                ? ">="
                : value.includes("<=")
                ? "<="
                : value.includes(">")
                ? ">"
                : value.includes("<")
                ? "<"
                : "=="
            value = value.replaceAll("<", "").replaceAll(">", "").replaceAll("=", "")
            filterPossibleValue(([_, info]) => eval(`${info.health}${op}${value}`))
            return `have health {n} ${op}${value}`
        },
    },
    power: {
        alias: ["p"],
        description: "Filter for power. Can compare with numeric expression (`>`,`>=`, etc.)",
        callback: (value, _, filterPossibleValue) => {
            const op = value.includes(">=")
                ? ">="
                : value.includes("<=")
                ? "<="
                : value.includes(">")
                ? ">"
                : value.includes("<")
                ? "<"
                : "=="
            value = value.replaceAll("<", "").replaceAll(">", "").replaceAll("=", "")
            filterPossibleValue(([_, info]) => eval(`${info.attack}${op}${value}`))

            return `have power {n} ${op}${value}`
        },
    },
    powerhealth: {
        alias: ["ph"],
        description: "Filter for total power and health. Can compare with numeric expression (`>`,`>=`, etc.)",
        callback: (value, _, filterPossibleValue) => {
            const op = value.includes(">=")
                ? ">="
                : value.includes("<=")
                ? "<="
                : value.includes(">")
                ? ">"
                : value.includes("<")
                ? "<"
                : "=="
            value = value.replaceAll("<", "").replaceAll(">", "").replaceAll("=", "")
            filterPossibleValue(([_, info]) => eval(`${info.attack + info.health}${op}${value}`))

            return `have power health total {n} ${op}${value}`
        },
    },
    is: {
        alias: [],
        description:
            "Filter for type of card. List of nickname can be found [here](https://github.com/khanhfg/MagpieTutor#nicknames)",
        callback: (value, _, filterPossibleValue) => {
            const nicknameList = {
                vanilla: ([_, info]) => !info.sigils,
                tank: ([_, info]) => info.health > 5,
                glass: ([_, info]) => info.attack > info.health,
                square: ([_, info]) => info.attack == info.health,
                reflected: ([_, info]) => info.attack >= info.health,
                traitless: ([_, info]) => !info.traits,
                removal: ([name, _]) => {
                    const removalList = [
                        "explode bot",
                        "mrs. bomb",
                        "adder",
                        "mirrorbot",
                        "shutterbug",
                        "drowned soul",
                        "long elk",
                        "plasma jimmy",
                    ]
                    return removalList.includes(name)
                },
                banned: ([_, info]) => info.banned,
                free: ([_, info]) => !info.blood_cost && !info.bone_cost && !info.energy_cost && !info.mox_cost,
            }
            let callback = nicknameList[value]
            filterPossibleValue(callback ? callback : (_) => false)
            return `is {n} ${value}`
        },
    },
    name: {
        alias: "n",
        description: "Filter for name",
        callback: (value, _, filterPossibleValue) => {
            filterPossibleValue(([name, _]) => name.toLowerCase().includes(value.toLowerCase()))

            return `have name {n} includes ${value}`
        },
    },
    regex: {
        alias: ["rx"],
        description: "Filter for regex match in name",
        callback: (value, _, filterPossibleValue) => {
            filterPossibleValue(([name, _]) => name.match(value))

            return `have name {n} match ${value}`
        },
    },
}

// function hell
function getEmoji(name) {
    newname = name.replaceAll("green", "emerald").replaceAll("blue", "sapphire").replaceAll("orange", "ruby")
    return `<:${client.emojis.cache.find((emoji) => emoji.name === newname).identifier}>`
}

function numToEmoji(num) {
    let out = ""
    for (const digit of num + []) {
        if (digit === "-") {
            out += getEmoji("negative")
        } else out += getEmoji(`${digit}_`)
    }
    return out
}

function coloredString(str, raw) {
    const codeList = {
        $$g: "\u001b[0;30m",
        $$r: "\u001b[0;31m",
        $$e: "\u001b[0;32m",
        $$y: "\u001b[0;33m",
        $$b: "\u001b[0;34m",
        $$p: "\u001b[0;35m",
        $$c: "\u001b[0;36m",
        $$w: "\u001b[0;37m",

        $$1: "\u001b[0;40m",
        $$2: "\u001b[0;41m",
        $$3: "\u001b[0;42m",
        $$4: "\u001b[0;43m",
        $$5: "\u001b[0;44m",
        $$6: "\u001b[0;45m",
        $$7: "\u001b[0;46m",
        $$8: "\u001b[0;47m",

        $$l: "\u001b[1m",
        $$u: "\u001b[4m",

        $$0: "\u001b[0m",
    }

    for (const code of Object.keys(codeList)) {
        str = str.replaceAll(code, codeList[code])
    }
    return raw ? str : `\`\`\`ansi\n${str}\`\`\``
}

async function messageSearch(message, returnValue = false) {
    const start = performance.now()
    let embedList = []
    let attachmentList = []
    let msg = ""
    if (!message.content.toLowerCase().match(searchRegex)) {
        return
    }
    console.log(
        chalk.blue(
            `Message with content: "${chalk.green(message.content)}" in ${chalk.red.bold(
                message.guild ? message.guild.name : "DM"
            )} by ${chalk.orange.bold(message.author.username)} detected searching time ${chalk.magenta("OwO")}`
        )
    )
    let cards = []
    outer: for (let cardMatch of message.content.toLowerCase().matchAll(searchRegex)) {
        let modifierCode = cardMatch[1]
        let selectedSet = [
            SetList[cardMatch[2]] ?? SetList[serverDefaultSet[message.guildId]?.default] ?? SetList["com"],
        ]
        let name = cardMatch[3]
        let card

        let noAlter = false
        let compactDisplay = false
        let noArt = false
        let sigilSearch = false
        let query = false
        let json = false
        let lazy = false
        let exact = false
        let dumb = false
        let fullCard = false

        for (const code of modifierCode) {
            const modifierSet = SetList[code]
            if (!modifierSet) break
            if (modifierSet.type == "special") {
                if (modifierSet.name == "magic the gathering") {
                    const card = await fetchMagicCard(name)

                    if (card == -1) {
                        embedList.push(
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setTitle(`Card "${name}" not found`)
                                .setDescription(`Magic card ${name} not found\n`)
                        )
                    } else {
                        attachmentList.push(card.image_uris.normal)
                    }
                }
                continue outer
            } else if (modifierSet.type == "modifier") {
                if (modifierSet.name == "original version") {
                    noAlter = true
                } else if (modifierSet.name == "compact") {
                    compactDisplay = true
                } else if (modifierSet.name == "no portrait") {
                    noArt = true
                } else if (modifierSet.name == "sigil") {
                    sigilSearch = true
                } else if (modifierSet.name == "no search") {
                    continue outer
                } else if (modifierSet.name == "query") {
                    query = true
                } else if (modifierSet.name == "json") {
                    json = true
                } else if (modifierSet.name == "lazy") {
                    lazy = true
                    selectedSet = Object.keys(setsData).map((name) =>
                        Object.values(SetList).find((s) => s.name == name)
                    )
                } else if (modifierSet.name == "exact") {
                    exact = true
                } else if (modifierSet.name == "dumb") {
                    dumb = true
                } else if (modifierSet.name == "full card") {
                    fullCard = true
                }
            }
        }

        if (!dumb) {
            if (name.includes(":")) {
                query = true
            }
        }

        let temp = []
        let lazyList = []
        let bestRating = 0

        for (const set of selectedSet) {
            let bestMatch = exact
                ? { target: name, rating: 1 }
                : StringSimilarity.findBestMatch(
                      name,
                      sigilSearch ? Object.keys(setsData[set.name].sigils) : Object.keys(setsData[set.name].cards)
                  ).bestMatch
            if (sigilSearch) {
                if (!setsData[set.name].sigils) continue
                if (bestMatch.rating <= matchPercentage) {
                    if (!lazy) {
                        embedList.push(
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setTitle(`Sigil "${name}" not found`)
                                .setDescription(
                                    `No Sigil found in selected set (${
                                        setsData[set.name].ruleset
                                    }) that have more than 40% similarity with the search term(${name})`
                                )
                        )
                        continue
                    }
                }

                temp = genSigilEmbed(bestMatch.target, setsData[set.name].sigils[bestMatch.target])
            } else if (query) {
                temp = queryCard(name, set, compactDisplay)
            } else if (json) {
                msg += `\`\`\`json\n${JSON.stringify(
                    fetchCard(bestMatch.target, set.name, true),
                    null,
                    compactDisplay ? 0 : 2
                )}\`\`\``
            } else {
                // if less than 40% match return error and continue to the next match
                if (bestMatch.rating <= 0.4) {
                    if (!lazy) {
                        embedList.push(
                            new EmbedBuilder()
                                .setColor(Colors.Red)
                                .setTitle(`Card "${name}" not found`)
                                .setDescription(
                                    `No card found in selected set (${
                                        setsData[set.name].ruleset
                                    }) that have more than 40% similarity with the search term(${name})`
                                )
                        )
                        continue
                    }
                } else {
                    card = fetchCard(bestMatch.target, set.name, noAlter, noArt, fullCard)
                }
            }

            if (card) {
                if (!lazy) cards.push(card)
                if (lazy) {
                    if (bestMatch.rating > bestRating) {
                        lazyList = [card]
                        bestRating = bestMatch.rating
                    } else if (bestMatch.rating == bestRating) {
                        lazyList.push(card)
                    }
                } else {
                    temp = await genCardEmbed(card, compactDisplay)
                }
            }
            if (temp.length > 1) {
                embedList.push(temp[0])
                if (temp[1] != 1) {
                    attachmentList.push(temp[1])
                }
            }
        }

        if (lazy) {
            if (lazyList.length < 1) {
                embedList.push(
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("No card found")
                        .setDescription("No card found in all selected set")
                )
                continue
            }
            cards = cards.concat(lazyList)
            for (const card of lazyList) {
                let temp = await genCardEmbed(card, compactDisplay)
                if (temp.length > 1) {
                    embedList.push(temp[0])
                    if (temp[1] != 1) {
                        attachmentList.push(temp[1])
                    }
                }
            }
        }
    }

    let replyOption = {
        allowedMentions: {
            repliedUser: false,
        },
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel("Retry").setCustomId("retry").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setLabel("Remove Cache").setCustomId("removeCache").setStyle(ButtonStyle.Danger)
            ),
        ],
    }

    const end = performance.now()

    if (msg != "") {
        replyOption["content"] = msg
        if (replyOption["content"].length > 2000) replyOption["content"] = "Message too large"
    }
    if (embedList.length > 0) replyOption["embeds"] = embedList
    if (attachmentList.length > 0) replyOption["files"] = attachmentList

    if (replyOption["content"] || replyOption["embeds"] || replyOption["files"]) {
        replyOption["content"] =
            (replyOption["content"] ? replyOption["content"] : "") +
            `\nSearch complete in ${(end - start).toFixed(1)}ms`
        if (returnValue) return replyOption

        const replyMsg = await message.reply(replyOption)
        for (const [index, embed] of replyMsg.embeds.entries()) {
            if (!cards[index]) continue
            if (cards[index].url && !portraitCaches[cards[index].url]) {
                if (!embed.thumbnail) continue
                portraitCaches[cards[index].url] = embed.thumbnail.proxyURL
                console.log(chalk.green(`${cards[index].name} cache created`))
            }
        }
        fs.writeFileSync("./extra/caches.json", JSON.stringify(portraitCaches, null, 4))
    }
}

function genDescription(textFormat, card) {
    let out = {}

    for (const field of Object.values(textFormat.body)) {
        completeInfo = ""

        if (field.type == "keyword") {
            if (card[field.var]) {
                card[field.var].forEach((keyword) => {
                    completeInfo += `**${keyword}**: ${setsData[card.set].sigils[keyword]}\n`
                })
            }
        } else if (field.type == "special_keyword") {
            if (card[field.var]) {
                card[field.var].forEach((keyword) => {
                    completeInfo += `**${keyword.name}**: ${keyword.description}`
                })
            }
        } else {
            for (const info of Object.values(field.info)) {
                if (!info.text.match(/{(\w+)}/g)) {
                    completeInfo += info.text
                    continue
                }
                let temp = card[info.text.match(/{(\w+)}/g)[0].slice(1, -1)]
                if (!temp) continue
                if (info.type == "mox") {
                    if (temp.length < 1) continue
                    // idk what this do anymore i was very high
                    temp = {} // make a dict to put them in so .format can use it as key
                    temp[info.text.match(/{(\w+)}/g)[0].slice(1, -1)] /* field name = var name */ = card[
                        info.text.match(/{(\w+)}/g)[0].slice(1, -1)
                    ]
                        .map((a) => `:${a}:`.toLowerCase())
                        .join("") // put the mox in : to make it emoji
                    completeInfo += info.text.format(temp)
                } else if (info.type == "list") {
                    completeInfo += info.text.format(card)
                } else if (info.type == "stat") {
                    completeInfo += info.text.replace(
                        "{health}",
                        `**Stat**: ${card.atkspecial ? `:${card.atkspecial}:` : card.attack} / ${card.health} ${
                            card.atkspecial ? `(${specialAttackDescription[card.atkspecial]})` : ""
                        }`
                    )
                } else if (info.type == "sub") {
                    completeInfo += info.text.format(card)
                }
            }
        }
        if (field.type == "general") {
            out["general"] = completeInfo
        } else {
            out[field.name] = completeInfo
        }
    }
    return out
}

function genTitle(textFormat, card) {
    let completeInfo = ""
    for (const info of textFormat.title) {
        if (info.type == "con") {
            if (eval(info.condition)) {
                completeInfo += info.text
            }
        } else if (info.type == "set") {
            completeInfo += info.text.replaceAll("{set}", setsData[card.set].ruleset)
        } else if (info.type == "sub") {
            if (!info.text.match(/{(\w+)}/g)) {
                completeInfo += info.text
                continue
            }
            let temp = card[info.text.match(/{(\w+)}/g)[0].slice(1, -1)]
            if (!temp) continue
            completeInfo += info.text.format(card)
        }
    }
    let alreadyChange = []
    // replace :emoji-name: with emoji
    for (const emoji of completeInfo.matchAll(/:([^\sx:]+):/g)) {
        if (alreadyChange.includes(emoji[0])) continue
        try {
            if (!isNaN(parseInt(emoji[1]))) {
                completeInfo = completeInfo.replaceAll(emoji[0], numToEmoji(emoji[1]))
                continue
            }
            completeInfo = completeInfo.replaceAll(emoji[0], getEmoji(emoji[1]))
        } catch {}
        alreadyChange.push(emoji[0])
    }
    return completeInfo
}

function genColor(textFormat, card) {
    for (const con of Object.keys(textFormat.color)) {
        if (eval(con)) {
            return textFormat.color[con]
        }
    }
    return Colors.Grey
}

// fetch the card and its url
function fetchCard(name, setName, noAlter = false, noArt = false, fullCard = false,) {
    let card

    let set = setsData[setName]

    try {
        card = deepCopy(set.cards[name])
    } catch {} // look for the card in the set

    if (!card) return card

    card.set = setName
    if (card.noArt || noArt) {
        card.url = undefined
    } else if (card.fullCard == true) {
        if (set == "augmented") {
            card.url = `https://github.com/answearingmachine/inscryption-augmented-image-host/tree/main/SNAP/${cardFormated.temple.replaceAll(" ", "%20")}/${cardFormated.tier.replaceAll(" ", "%20")}/${card.name.replaceAll(" ", "%20")}.png`
        } else if (set == "custom tcg inscryption" || set == "desaft's mod (CTI)") {
            card.url = `https://github.com/SaxbyMod/NotionAssets/tree/main/Formats/${cardFormated.format.replaceAll(" ", "%20")}/${card.name.replaceAll(" ", "%20")}.png`
        } 
    }
    else if (card.pixport_url) {
        card.url = card.pixport_url
    } else {
        card.url = `https://github.com/107zxz/inscr-onln/raw/main/gfx/pixport/${card.name.replaceAll(" ", "%20")}.png`
    }

    if (Object.keys(portraitCaches).includes(card.url)) {
        card.fullUrl = portraitCaches[card.url]
        card.noArt = true
    }

    let original = deepCopy(card)

    if (noAlter) {
        return card
    }

        // change existing card info and custom url
        if (setName != "augmented" && setName != "custom tcg inscryption" && setName != "desafts mod (cti)") {
            if (card.name == "Fox") {
                card.url =
                    "https://cdn.discordapp.com/attachments/1038091526800162826/1069256708783882300/Screenshot_2023-01-30_at_00.31.53.png"
            } else if (card.name == "Geck") {
                card.sigils = ["Omni Strike"]
            } else if (card.name == "Bell Tentacle") {
                card.atkspecial = "bell"
            } else if (card.name == "Hand Tentacle") {
                card.atkspecial = "hand"
            } else if (card.name == "Ruby Dragon") {
                card.url =
                    "https://cdn.discordapp.com/attachments/999643351156535296/1082825510888935465/portrait_prism_dragon_gbc.png"
    
                card.name = "GAY DRAGON"
                card.description = "Modified portrait by ener"
            } else if (card.name == "Horse Mage") {
                card.description = `Not make by ener :trolled:`
            } else if (card.name == "The Moon") {
                card.sigils = [
                    "Omni Strike",
                    "Tidal Lock",
                    "Made of Stone",
                    "Mighty Leap",
                ]
            } else if (card.name == "Ouroboros") {
                card.description = "Ouroboros is the source of all evil - 107"
            } else if (card.name == "Blue Mage") {
                card.url =
                    "https://cdn.discordapp.com/attachments/1013090988354457671/1130690799152148571/11111.jpg"
            }
        }

    if (JSON.stringify(original) != JSON.stringify(card)) {
        card.footnote =
            'This card has been edited to view original put "o" in front of you search.\nEx: ete[[adder]] -> oete[[adder]]'
    }

    return card
}

// fetch the mtg card and its url
async function fetchMagicCard(name) {
    out = await scryfall.getCardByName(name, true).catch(async (_) => {
        return -1
    })

    return out
}

// generate embed
async function genCardEmbed(card, compactDisplay = false, id = randStr()) {
    let attachment
    // try getting the portrait if it doesn't exist render no portrait
    try {
        if (card.url && !card.noArt) {
            // get the card pfp
            let cardPortrait = await Canvas.loadImage(card.url)
            const scale = 5
            // scale the pfp
            const portrait = Canvas.createCanvas(cardPortrait.width * scale, cardPortrait.height * scale)
            const context = portrait.getContext("2d")
            context.imageSmoothingEnabled = false
            if (card.set == SetList.aug.name) {
                context.drawImage(
                    await Canvas.loadImage(
                        `https://github.com/answearingmachine/card-printer/raw/main/dist/printer/assets/bg/bg_${
                            ["Common", "Uncommon", "Side Deck"].includes(card.tier) ? "common" : "rare"
                        }_${card.temple.toLowerCase()}.png`
                    ),
                    0,
                    0,
                    portrait.width,
                    portrait.height
                )
            }
            context.drawImage(cardPortrait, 0, 0, portrait.width, portrait.height)

            attachment = new AttachmentBuilder(await portrait.encode("png"), {
                name: `${id}.png`,
            })
        }
    } catch {
        // cache missing portrait
        portraitCaches[card.url] = null
        fs.writeFileSync("./extra/caches.json", JSON.stringify(portraitCaches, null, 4))
    }

    const format = Object.values(SetList).find((set) => set.name == card.set)[
        compactDisplay ? "compactFormat" : "format"
    ]
    // create template
    let embed = new EmbedBuilder().setColor(genColor(format, card)).setTitle(genTitle(format, card))

    if (attachment) embed.setThumbnail(`attachment://${id}.png`)
    else if (card.fullUrl) {
        embed.setThumbnail(card.fullUrl)
    }

    const info = genDescription(format, card)

    // replace emoji shorthand to actual emoji identifier
    let alreadyChange = []
    for (let field of Object.keys(info)) {
        for (const emoji of info[field].matchAll(/:([^\sx:]+):/g)) {
            if (alreadyChange.includes(emoji[0])) continue
            try {
                if (!isNaN(parseInt(emoji[1]))) {
                    info[field] = info[field].replaceAll(emoji[0], numToEmoji(emoji[1]))
                    continue
                }
                info[field] = info[field].replaceAll(emoji[0], getEmoji(emoji[1]))
            } catch {}
            alreadyChange.push(emoji[0])
        }
    }

    info.general = info.general.replaceAll(":x_:", getEmoji("x_"))

    for (const fieldName of Object.keys(info)) {
        if (fieldName == "general") {
            embed.setDescription(info[fieldName])
        } else {
            if (info[fieldName])
                embed.addFields({
                    name: fieldName,
                    value: info[fieldName],
                })
        }
    }

    if (card.footnote) {
        embed.setFooter({ text: card.footnote })
    }
    return [embed, attachment ? attachment : 1] // if there an attachment (portrait/image) return it if not give exit code 1
}

function genSigilEmbed(sigilName, sigilDescription) {
    let embed = new EmbedBuilder().setColor(Colors.Aqua).setTitle(`${sigilName}`).setDescription(sigilDescription)
    return [embed, 1]
}

function Capitalize(str) {
    str.toLowerCase().split(" ").map(w => w[0].toUpperCase() + w.substring(1)).join(" ")
}

function queryCard(string, set, compactDisplay = false) {
    let embed = new EmbedBuilder().setColor(Colors.Purple)
    let possibleMatches = setsData[set.name].cards
    let searchExplain = []
    for (const tag of string.matchAll(queryRegex)) {
        let type = tag[2],
            value = tag[3].replaceAll('"', "")
        let negation = !!tag[1]

        const filterPossibleValue = (callback) => {
            possibleMatches = Object.fromEntries(
                Object.entries(possibleMatches).filter((c) => (negation ? !callback(c) : callback(c)))
            )
        }

        for (const [key, keyInfo] of Object.entries(queryKeywordList)) {
            if (type == key || keyInfo.alias.includes(type)) {
                searchExplain.push(
                    keyInfo.callback(value, set, filterPossibleValue).replace("{n} ", negation ? "not " : "")
                )
            }
        }
    }
    const final = Object.keys(possibleMatches)
    const result = `**Card(s) that ${searchExplain.join(", ").replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}**:\n${final
        .join(", ")
        .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}`

    embed.setTitle(`Result: ${final.length} cards found in ${setsData[set.name].ruleset}`)
    embed.setDescription(
        compactDisplay
            ? `**Card that ${searchExplain.join(", ")}**:\nResult hidden by compact mode`
            : final.length > 0
            ? result.length > 4096 // checking if it excess the char limit
                ? "Too many result, please be more specific"
                : result
            : "No card found"
    )
    return [embed, 1]
}

// on ready call
client.once(Events.ClientReady, () => {
    if (doneSetup) {
        console.log(chalk.bgGreen.black("Setup is complete and bot is connected to Discord's sever"))
        const servers = Array.from(client.guilds.cache).map((s) => s[1].name)
        infoLog(chalk.cyan(`Bot is in ${servers.length} server`))
        infoLog(chalk.cyan(`Servers: ${servers.map((s, i) => chalk[colorList[i % colorList.length]](s)).join(", ")}`))
    } else {
        console.log(chalk.bgRed("Bot connected to Discord's server but wait until set up is complete to use"))
    }
    client.user.setActivity("Reading and Indexing cards to our Database.")
    if (scream) {
        client.channels.cache
            .find((c) => c.id == "1095885953958158426")
            .send(`Hey you mess up the Json again.\n\`\`\`${log}\`\`\``)
    }
})

// on commands call
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const { commandName, options } = interaction
        if (commandName == "echo") {
            if (!isPerm(interaction)) return
            const message = options.getString("text")
            console.log(`${interaction.user.username} say ${message}`)
            const channel =
                options.getChannel("channel") != undefined ? options.getChannel("channel") : interaction.channel

            if (options.getString("message")) {
                ;(await getMessage(interaction.channel, options.getString("message"))).reply(message)
            } else {
                channel.send(message)
            }

            await interaction.reply({
                content: "Sent",
                ephemeral: true,
            })
        } else if (commandName == "set-code") {
            let temp = ""
            Object.keys(SetList).forEach((key) => {
                temp += `**${key}**: ${SetList[key].name}${SetList[key].type == "modifier" ? " (Modifier)" : ""}\n`
            })
            await interaction.reply(
                `Possible set code for searching:\n\n${temp}\nModifier can be add in front of set code to modify the output. Ex: \`sete\` will look up a sigil in the Eternal set`
            )
        } else if (commandName == "ping") {
            await interaction.reply(
                randInt(1, 4) == 4
                    ? randomChoice([
                          "Mike, If you are reading this, you've been in a coma for 5 years, we're trying a new technique, please, wake up.",
                          "Something Something",
                          "Soon",
                          "We been trying to reach you about your car extended warranty",
                          "babe wake up the bot is online",
                          "I'm doing your mom at this very instance",
                          "What did I miss",
                          "New update in sometime",
                          "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                          "https://www.youtube.com/watch?v=b7vWLz9iGsk",
                          "I don't know who you are. I don't know what you want. If you are looking for ransom I can tell you I don't have money, but what I do have are a very particular set of skills. Skills I have acquired over a very long career. Skills that make me a nightmare for people like you. If you let my daughter go now that'll be the end of it. I will not look for you, I will not pursue you, but if you don't, I will look for you, I will find you and I will kill you.",
                          "Stoat is not dense >:(",
                          "Crazy?\nI was crazy once\nThey lock me in a room\nA rubber room\nA rubber room with rats\nThe rats make me crazy\nCrazy?\nI was crazy once\nThey lock me in a room\nA rubber room\nA rubber room with rats\nThe rats make me crazy\nCrazy?\nI was crazy once\nThey lock me in a room\nA rubber room\nA rubber room with rats\nThe rats make me crazy\nCrazy?\nI was crazy once\nThey lock me in a room\nA rubber room\nA rubber room with rats\nThe rats make me crazy\n",
                      ])
                    : "Pong!"
            )
        } else if (commandName == "restart") {
            if (isPerm(interaction)) {
                await interaction.reply(
                    randomChoice(["Restarting...", "AAAAAAAAAAAAAAAAAAAAAAAA", "No father don't kill me"])
                )
                throw new Error("death")
            } else await interaction.reply("no")
        } else if (commandName == "draft") {
            // grab the important shit
            const setName = options.getString("set") // get the set name
            const set = Object.values(SetList).find((v) => v.name == setName)
            const deckSize = options.getInteger("size") // get deck size
                ? options.getInteger("size")
                : 20

            const message = await interaction.reply({
                content: "Loading...",
                fetchReply: true,
            })

            //get the set pack structure
            const packStructure = set.packStructure

            //fetch only the require card from the pack structure
            const pool = (() => {
                let out = {}
                for (const type of packStructure) {
                    if (type.amount == 0) {
                        Object.keys(out).forEach((k) => {
                            out[k] = listDiff(out[k], setsData[setName].pools[type.type])
                        })
                        continue
                    }
                    out[type.type] = setsData[setName].pools[type.type]
                }
                return out
            })()

            let deck = {
                cards: [],
                side_deck: "10 Squirrels",
            }
            let wildCount = 0
            let flag = false // exit flag
            let deckUniqueCount = {}

            // repeat for deck size
            for (let cycle = 0; cycle < deckSize; cycle++) {
                // putting card name into the pack
                let temp = []

                for (let type of packStructure) {
                    // if exclude type skip or pool too small and move on
                    if (type.amount == 0) continue
                    let amount = type.amount
                    //if the pool have 0 card and have a replacement use the replacement
                    outer: while (true) {
                        if (pool[type.type].length < 1)
                            if (type.replacement) {
                                type = packStructure.find((t) => t.type == type.replacement)
                                continue outer
                            } else continue
                        else {
                            break
                        }
                    }

                    if (!temp[type.type]) temp[type.type] = []

                    temp[type.type] = temp[type.type].concat(randomChoices(pool[type.type], amount))
                }
                //put card data in the pack using
                let pack = []
                for (const type of Object.keys(temp)) {
                    for (const name of temp[type]) {
                        let card = setsData[setName].cards[name]
                        card.type = type
                        pack.push(card)
                    }
                }

                // if the pack is missing cards push in wild card
                if (pack.length < packStructure.reduce((partialSum, a) => partialSum + a.amount, 0)) {
                    pack.push({
                        name: "WILD CARD",
                        attack: 100,
                        health: 100,
                    })
                }

                // generating embed and selection
                const embed = new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(
                        `Pack Left: ${deckSize - cycle}\nCard in deck: ${deck.cards.length}\nWild Count: ${wildCount}`
                    )

                const selectionList = new StringSelectMenuBuilder()
                    .setCustomId("select")
                    .setPlaceholder("Select a card!")

                let description = ""

                //generate the pack list
                for (const card of pack) {
                    for (let line of set.draftFormat) {
                        if (line.type == "sub") {
                            if (!card[line.text.match(/{(\w+)}/g)[0].slice(1, -1)]) continue
                            description += line.text.format(card)
                        } else if (line.type == "normal") {
                            description += line.text
                        } else if (line.type == "con") {
                            if (eval(line.con)) description += line.text
                        } else if (line.type == "mox") {
                            if (!card[line.text.match(/{(\w+)}/g)[0].slice(1, -1)]) continue
                            description += line.text.format(card)
                        } else if (line.type == "stat") {
                            description += line.text.replace(
                                "{s}",
                                `${card.atkspecial ? `:${card.atkspecial}:` : card[line.attackVar]} / ${
                                    card[line.healthVar]
                                }`
                            )
                        } else if (line.type == "list") {
                            if (!card[line.var]) continue
                            description += line.text.replace("{s}", card[line.var])
                        }
                    }
                    description += "\n\n"

                    // add the card to selection
                    selectionList.addOptions({
                        label: card.name,
                        value: card.name,
                    })
                }

                // load the deck dup to check for restriction later
                let deckStr = ""
                let deckDup = countDup(
                    deck.cards.sort((a, b) => (a.startsWith("*") ? -1 : b.startsWith("*") ? 1 : a.localeCompare(b)))
                )

                // generate the deck preview
                for (const card of Object.keys(deckDup)) {
                    deckStr += `${deckDup[card]}x | ${card}\n`
                }

                // add pack and preview into embed
                embed.addFields(
                    {
                        name: "=============== PACK ===============",
                        value: description,
                        inline: true,
                    },
                    {
                        name: `======= DECK =======`,
                        value: deck.cards.length < 1 ? "Blank" : deckStr,
                        inline: true,
                    }
                )

                // send embed and selection
                await interaction.editReply({
                    content: "",
                    components: [new ActionRowBuilder().addComponents(selectionList)],
                    embeds: [embed],
                })

                const filter = (i) => i.user.id === interaction.user.id

                // process the selection
                let error = ""
                await message
                    .awaitMessageComponent({
                        componentType: ComponentType.StringSelect,
                        time: 180000,
                        filter,
                    })
                    .then(async (i) => {
                        const card = pack.find((c) => c.name == i.values[0])
                        if (card.name == "WILD CARD") {
                            wildCount++
                        } else {
                            deck.cards.push(card.name)
                            if (!deckUniqueCount[card.type]) deckUniqueCount[card.type] = 0
                            deckUniqueCount[card.type]++
                            if (countDup(deck.cards) >= set.draftRestriction[card.type].copyPerDeck) {
                                // if more than or equal to the allowed same name copy per deck remove this card from pool
                                pool[card.type].splice(pool[card.type].indexOf(card.name.toLowerCase()), 1)
                            }
                            if (deckUniqueCount[card.type] >= set.draftRestriction[card.type].uniquePerDeck) {
                                //if more than or equal to the amount of unique copy remove this pool completely
                                pool[card.type] = []
                            }
                        }
                        await i.update("added")
                    })
                    .catch((err) => {
                        flag = true
                        error = err
                    })

                if (flag) {
                    await interaction.editReply({
                        content: `Error: ${coloredString(`$$r${error}`)}\nCurrent deck: ${deck.cards.join(
                            ", "
                        )}\n\nCurrent Deck Json: \`${JSON.stringify(deck)}\``,
                        embeds: [],
                        components: [],
                    })
                    break
                }
            }

            if (flag) return

            await interaction.editReply({
                content: `${
                    wildCount > 0
                        ? `**You have ${wildCount} Wild Card. You can replace them with any common card**\n`
                        : ""
                }Completed Deck: ${deck.cards.join(", ")}\n\nDeck Json: \`${JSON.stringify(deck)}\``,
                embeds: [],
                components: [],
            })
        } else if (commandName == "deck-sim") {
            let fullDeck = []
            let fullSide = []
            if (options.getAttachment("deck-file")) {
                const set = options.getString("set")
                if (!set) return await interaction.reply("MISSING SET WHEN USING FILE")
                const deckFile = JSON.parse(await (await fetch(options.getAttachment("deck-file").url)).text())
                fullDeck = deckFile.cards
                if (deckFile.side_deck_cards) {
                    fullSide = deckFile.side_deck_cards
                } else if (deckFile.side_deck_cat) {
                    fullSide = Array(
                        setsData[set].side_decks[deckFile.side_deck].cards[deckFile.side_deck_cat].count
                    ).fill(setsData[set].side_decks[deckFile.side_deck].cards[deckFile.side_deck_cat].card)
                } else {
                    fullSide = Array(setsData[set].side_decks[deckFile.side_deck].count).fill(
                        setsData[set].side_decks[deckFile.side_deck].card
                    )
                }
            } else if (options.getString("deck-list")) {
                let temp = options.getString("deck-list").split(";")
                temp = temp.map((i) => i.split(","))
                fullDeck = temp[0]
                fullSide = temp[1] ? temp[1] : []
            } else {
                await interaction.reply("Deck missing")
                return
            }

            let currDeck = deepCopy(fullDeck)
            let currSide = deepCopy(fullSide)

            const message = await interaction.reply({
                content: "Doing stuff please wait",
                fetchReply: true,
            })
            let stillRunning = true
            const detailMode = options.getBoolean("detail")

            let hand = drawList(currDeck, 3)

            while (stillRunning) {
                let tempStr = ""
                let currDup = countDup(hand)
                Object.keys(currDup).forEach((c) => {
                    tempStr += `${currDup[c]}x ${c}\n`
                })

                let embed = new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setTitle("Thingy")
                    .setDescription(
                        `Card left in Main Deck: ${currDeck.length}\nCard left in Side Deck: ${currSide.length}`
                    )
                    .addFields({
                        name: "====== HAND ======",
                        value: tempStr,
                        inline: true,
                    })

                if (detailMode) {
                    tempStr = ""
                    let currDup = countDup(currDeck)
                    let fullDup = countDup(fullDeck)
                    Object.keys(currDup).forEach((c) => {
                        const percentage = (currDup[c] / currDeck.length) * 100
                        tempStr += `${currDup[c]}/${fullDup[c]}) ${c} (${percentage.toFixed(1)}%)\n`
                    })
                    if (tempStr === "") {
                        tempStr += "No Card Left"
                    }
                    embed.addFields({
                        name: "====== DRAW PERCENTAGE ======",
                        value: tempStr,
                        inline: true,
                    })
                }

                let selectionList = new StringSelectMenuBuilder()
                    .setPlaceholder("Select a card to play/remove/discard")
                    .setCustomId("play")

                for (n of new Set(hand)) {
                    selectionList.addOptions({
                        label: n,
                        value: n,
                    })
                }

                await interaction.editReply({
                    embeds: [embed],
                    components: [
                        new ActionRowBuilder().addComponents(selectionList),
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setLabel("Draw Main").setStyle(ButtonStyle.Success).setCustomId("main"),
                            new ButtonBuilder()
                                .setLabel("Draw Side")
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId("side"),
                            new ButtonBuilder()
                                .setLabel("Create Card")
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId("create"),
                            new ButtonBuilder()
                                .setLabel("Fetch Card")
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId("fetch"),
                            new ButtonBuilder().setLabel("End").setStyle(ButtonStyle.Danger).setCustomId("end")
                        ),
                    ],
                })

                const filter = (i) => i.user.id === interaction.user.id

                await message
                    .awaitMessageComponent({
                        time: 180000,
                        filter,
                    })
                    .then(async (inter) => {
                        if (inter.customId === "main") {
                            currDup = drawList(currDeck, 1)[0]
                            if (currDup) {
                                hand.push(currDup)
                                await inter.update(`You've drawn ${currDup}`)
                            } else {
                                await inter.update(`Main is Empty`)
                            }
                        } else if (inter.customId === "side") {
                            currDup = drawList(currSide, 1)[0]
                            if (currDup) {
                                hand.push(currDup)
                                await inter.update(`You've drawn ${currDup}`)
                            } else {
                                await inter.update(`Side is Empty`)
                            }
                        } else if (inter.customId === "play") {
                            hand.splice(hand.indexOf(inter.values[0]), 1)
                            await inter.update(`Played ${inter.values[0]}`)
                        } else if (inter.customId === "create") {
                            // Create the modal
                            const modal = new ModalBuilder().setCustomId("create").setTitle("Create Card")

                            // Add components to modal
                            modal.addComponents(
                                new ActionRowBuilder().addComponents(
                                    new TextInputBuilder()
                                        .setLabel("What card do you want to create")
                                        .setPlaceholder("Enter Card Name!")
                                        .setStyle(TextInputStyle.Short)
                                        .setCustomId("card")
                                )
                            )

                            // Show the modal to the user
                            await inter.showModal(modal)

                            await inter
                                .awaitModalSubmit({ time: 10000, filter })
                                .then(async (i) => {
                                    hand.push(i.fields.getTextInputValue("card"))
                                    await i.update(`Created ${i.fields.getTextInputValue("card")}`)
                                })
                                .catch((_) => inter.update())
                        } else if (inter.customId === "fetch") {
                            // Create the modal
                            const modal = new ModalBuilder().setCustomId("fetch").setTitle("Fetch Card")

                            // Add components to modal
                            modal.addComponents(
                                new ActionRowBuilder().addComponents(
                                    new TextInputBuilder()
                                        .setLabel("Card in deck (not to be edit)")
                                        .setValue([...new Set(currDeck)].join("\n"))
                                        .setStyle(TextInputStyle.Paragraph)
                                        .setCustomId("eeeee")
                                        .setRequired(false)
                                ),
                                new ActionRowBuilder().addComponents(
                                    new TextInputBuilder()
                                        .setLabel("What card do you want to fetch")
                                        .setPlaceholder("Enter Card Name!")
                                        .setStyle(TextInputStyle.Short)
                                        .setCustomId("card")
                                        .setRequired(true)
                                )
                            )

                            // Show the modal to the user
                            await inter.showModal(modal)

                            await inter.awaitModalSubmit({ time: 10000, filter }).then(async (i) => {
                                if (currDeck.length > 1) {
                                    const bestMatch = StringSimilarity.findBestMatch(
                                        i.fields.getTextInputValue("card").toLowerCase(),
                                        currDeck
                                    )
                                    hand.push(currDeck[bestMatch.bestMatchIndex])
                                    currDeck.splice(bestMatch.bestMatchIndex, 1)

                                    await i.update(`Fetched ${bestMatch.bestMatch.target}`)
                                } else {
                                    await i.update("")
                                }
                            })
                        } else if (inter.customId === "end") {
                            stillRunning = false
                            await inter.update("")
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                        stillRunning = false
                    })
            }

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle("Deck Simulation Ended")
                        .setDescription("The simulation Ended"),
                ],
                components: [],
            })
        } else if (commandName == "tunnel-status") {
            console.log("Command Received")
            http.get("http://localtunnel.me", async (_) => {
                await interaction.reply(
                    "Tunnel is up and running. If you have problem connecting, restart the game and try again"
                )
            }).on("error", async (_) => {
                await interaction.reply(
                    "Stoat's laptop say tunnel is down, but you can check it yourself [here](https://isitdownorjust.me/localtunnel-me/)"
                )
            })
        } else if (commandName == "color-text") {
            await interaction.reply({
                content: `Raw message:\n \\\`\\\`\\\`ansi\n${coloredString(
                    options.getString("string"),
                    true
                )}\\\`\\\`\\\`\n\nThe output will be like this:\n${coloredString(options.getString("string"))}`,
                ephemeral: true,
            })
        } else if (commandName == "guess-the-card") {
            const set = options.getString("set")
            const card = await (async () => {
                let name
                if (set == "augmented") name = randomChoice(setsData[set].pools.art)
                else if (set == "magic") {
                    const c = await scryfall.randomCard()
                    return { name: c.name, url: c.image_uris.art_crop }
                } else name = randomChoice(Object.keys(setsData[set].cards))
                return fetchCard(name, set)
            })()

            console.log(`The answer is ${card.name}`)

            // get the card picture
            const cardPortrait = await Canvas.loadImage(card.url)

            let bg
            if (set == "augmented") {
                bg = await Canvas.loadImage(
                    `https://github.com/answearingmachine/card-printer/raw/main/dist/printer/assets/bg/bg_${
                        ["Common", "Uncommon", "Side Deck"].includes(card.tier) ? "common" : "rare"
                    }_${card.temple.toLowerCase()}.png`
                )
            }

            let portrait
            let full

            if (options.getSubcommand() === "normal") {
                const percentage = options.getInteger("difficulty")
                    ? options.getInteger("difficulty")
                    : options.getInteger("size")
                    ? options.getInteger("size")
                    : 35

                const width = clamp(Math.floor((cardPortrait.width * percentage) / 100), 1, cardPortrait.width)
                const height = clamp(width, 1, cardPortrait.height)

                const scale = set == "magic" ? 1 : 50

                // get the first crop point
                const startCropPos = [randInt(0, cardPortrait.width - width), randInt(0, cardPortrait.height - height)]

                // make the canvas
                portrait = Canvas.createCanvas(width * scale, height * scale)

                let context = portrait.getContext("2d")

                context.imageSmoothingEnabled = false
                if (bg)
                    context.drawImage(
                        bg,
                        startCropPos[0],
                        startCropPos[1],
                        width,
                        height,
                        0,
                        0,
                        portrait.width,
                        portrait.height
                    )
                context.drawImage(
                    cardPortrait,
                    // source region
                    startCropPos[0],
                    startCropPos[1],

                    // size of the crop region
                    width,
                    height,

                    // position to place the region to
                    0,
                    0,

                    // size of the final
                    portrait.width,
                    portrait.height
                )

                // create full version canvas
                full = Canvas.createCanvas(cardPortrait.width * scale, cardPortrait.height * scale)

                context = full.getContext("2d")

                context.imageSmoothingEnabled = false

                // draw the portrait
                if (bg) context.drawImage(bg, 0, 0, full.width, full.height)
                context.drawImage(cardPortrait, 0, 0, full.width, full.height)

                // set the color and size of the box
                context.strokeStyle = "#f00524"
                context.lineWidth = full.width * (0.5 / 100)

                // draw the box
                context.strokeRect(startCropPos[0] * scale, startCropPos[1] * scale, width * scale, height * scale)
            } else if (options.getSubcommand() === "scramble") {
                const scale = set == "magic" ? 1 : 50
                // grab the column
                const col = parseInt(
                    (options.getString("difficulty")
                        ? options.getString("difficulty")
                        : options.getString("size")
                        ? options.getString("size")
                        : "5,3"
                    ).split(",")[0]
                )

                //grab the row
                const row = parseInt(
                    (options.getString("difficulty")
                        ? options.getString("difficulty")
                        : options.getString("size")
                        ? options.getString("size")
                        : "5,3"
                    ).split(",")[1]
                )

                // get each piece height and width
                const pieceWidth = cardPortrait.width / col
                const pieceHeight = cardPortrait.height / row

                // make the canvas
                portrait = Canvas.createCanvas(cardPortrait.width * scale, cardPortrait.height * scale)

                let context = portrait.getContext("2d")

                context.imageSmoothingEnabled = false

                let i = 0
                // make an array with all the position to grab piece from

                // list comprehension and shuffle it
                // [[i, j] for i in range(row) for j in range(col)]
                let lst = shuffleList(
                    (() => {
                        let out = []
                        ;[...Array(row).keys()].forEach((i) => [...Array(col).keys()].forEach((j) => out.push([i, j])))
                        return out
                    })()
                )

                // for all the piece
                for (let x = 0; x < col; x++) {
                    for (let y = 0; y < row; y++) {
                        if (bg) {
                            context.drawImage(
                                bg,
                                pieceWidth * lst[i][1],
                                pieceHeight * lst[i][0],
                                pieceWidth,
                                pieceHeight,
                                pieceWidth * scale * x,
                                pieceHeight * scale * y,
                                pieceWidth * scale,
                                pieceHeight * scale
                            )
                        }
                        context.drawImage(
                            cardPortrait,
                            pieceWidth * lst[i][1],
                            pieceHeight * lst[i][0],
                            pieceWidth,
                            pieceHeight,
                            pieceWidth * scale * x,
                            pieceHeight * scale * y,
                            pieceWidth * scale,
                            pieceHeight * scale
                        )

                        i++
                    }
                }

                full = Canvas.createCanvas(cardPortrait.width * scale, cardPortrait.height * scale)

                context = full.getContext("2d")

                context.imageSmoothingEnabled = false
                if (bg) context.drawImage(bg, 0, 0, full.width, full.height)
                context.drawImage(cardPortrait, 0, 0, full.width, full.height)
            }

            const message = await interaction.reply({
                content: "What card is this? Press the `Guess` button and submit the modal to guess",
                files: [new AttachmentBuilder(await portrait.encode("png"))],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("guess").setLabel("Guess").setStyle(ButtonStyle.Primary)
                    ),
                ],
                fetchReply: true,
            })

            let collecting = true
            const filter = (i) => i.user.id === interaction.user.id

            while (collecting) {
                await message
                    .awaitMessageComponent({ time: 180000, filter })
                    .then(async (inter) => {
                        const modal = new ModalBuilder().setCustomId("guessModal").setTitle("Enter your guess below")

                        modal.addComponents(
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId("guess")
                                    .setLabel("What is the card?")
                                    .setPlaceholder("Card name here")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                            )
                        )
                        await inter.showModal(modal)

                        await inter.awaitModalSubmit({ time: 15000, filter }).then(async (i) => {
                            if (
                                StringSimilarity.compareTwoStrings(
                                    card.name.toLowerCase(),
                                    i.fields.getTextInputValue("guess").toLowerCase()
                                ) >= 0.4
                            ) {
                                await i.update({
                                    content: `Your guess (${i.fields.getTextInputValue(
                                        "guess"
                                    )}) was correct. Actual name ${card.name}`,
                                    files: [new AttachmentBuilder(await full.encode("png"))],
                                    components: [],
                                })
                            } else {
                                await i.update({
                                    content: `Your guess (${i.fields.getTextInputValue(
                                        "guess"
                                    )}) was incorrect. The card was ${card.name}`,
                                    files: [new AttachmentBuilder(await full.encode("png"))],
                                    components: [],
                                })
                            }

                            collecting = false
                        })
                    })
                    .catch(async (e) => {
                        await interaction.editReply(`Error: ${coloredString(`$$r${e}`)}\nThe card was ${card.name}`)
                        collecting = false
                    })
            }
        } else if (commandName == "retry") {
            await messageSearch(await interaction.channel.messages.fetch(options.getString("message")))
            await interaction.reply({ content: "Retried", ephemeral: true })
        } else if (commandName == "react") {
            if (isPerm(interaction)) {
                ;(await getMessage(interaction.channel, options.getString("message"))).react(options.getString("emoji"))
                await interaction.reply({ content: "Reacted", ephemeral: true })
            }
        } else if (commandName == "query-info") {
            let temp = ""
            Object.keys(queryKeywordList).forEach((key) => {
                temp += `**${key}** [${queryKeywordList[key].alias}]: ${queryKeywordList[key].description}\n`
            })
            await interaction.reply({
                content: `Possible query keyword for searching:\nHow to read: [keyword name] [keyword alias]: [keyword description]\n\n${temp}\nIf you don't know how query work visit [the documentation](https://github.com/Mouthless-Stoat/MagpieTutor/wiki/Query)`,
                flags: [MessageFlags.SuppressEmbeds],
            })
        } else if (commandName == "test") {
        } else if (commandName == "poll") {
            const pollOption = options.getString("option").split(",")
            const time = options.getString("time").endsWith("m")
                ? parseInt(options.getString("time").slice(0, -1)) * 60000
                : options.getString("time").endsWith("s")
                ? parseInt(options.getString("time").slice(0, -1)) * 1000
                : options.getString("time")
            const endTime = ((Date.now() + time) / 1000).toFixed()
            const embed = new EmbedBuilder()
                .setColor(Colors.Purple)
                .setTitle(`Poll: ${options.getString("question")}`)
                .setDescription(
                    `Poll end <t:${endTime}:R>\n` +
                        pollOption.map((o) => `${pollOption.indexOf(o) + 1}: ${o}`).join("\n")
                )
            const selectMenu = new StringSelectMenuBuilder().setCustomId("pollSelect").setPlaceholder("Choose a option")
            for (const [index, option] of pollOption.entries()) {
                selectMenu.addOptions({
                    label: option,
                    value: index.toString(),
                })
            }
            const message = await interaction.reply({
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(selectMenu)],
                fetchReply: true,
            })

            let pollData = require("./extra/poll.json")
            pollData[message.id] = {
                endTime: endTime,
                question: options.getString("question"),
                optionResult: pollOption.map((value) => {
                    return { option: value, amount: 0 }
                }),
                alreadyVote: [],
            }
            fs.writeFileSync("./extra/poll.json", JSON.stringify(pollData), "utf8")

            await sleep(time)

            pollData = require("./extra/poll.json")
            await message.edit({
                content: "Poll ended",
                embeds: [
                    new EmbedBuilder()
                        .setTitle(pollData[message.id].question)
                        .setDescription(
                            `Winner: ${pollData[message.id].optionResult.sort((a, b) => b.amount - a.amount)[0].option}`
                        ),
                ],
                components: [],
            })
            delete pollData[message.id]

            fs.writeFileSync("./extra/poll.json", JSON.stringify(pollData), "utf8")
        } else if (commandName == "default-code") {
            serverDefaultSet[interaction.guildId] = {
                default: options.getString("default-set-code"),
                addon: options.getString("addon-set-code"),
            }
            await interaction.reply({
                content: "Default added",
                ephemeral: true,
            })
            fs.writeFileSync("./extra/default.json", JSON.stringify(serverDefaultSet))
        } else if (commandName == "deck-analysis") {
            await interaction.reply("Crunching number, this may take a while")
            const set = options.getString("set")

            let mainDeck = []
            // let sideDeck = []

            const deckFile = options.getAttachment("deck-file")
                ? JSON.parse(await (await fetch(options.getAttachment("deck-file").url)).text())
                : options.getString("deck-json")
                ? JSON.parse(options.getString("deck-json"))
                : {}

            for (const name of deckFile.cards) {
                mainDeck.push(fetchCard(name.toLowerCase(), set, true, true))
            }
            const embed = new EmbedBuilder()
                .setColor(Colors.Gold)
                .setTitle("Deck Analysis result")
                .setDescription("eeeeeeeee")

            const possibleMainHandCombinations = combinations(
                mainDeck.map((c) => c.name),
                3
            )
            const deckDup = Object.fromEntries(
                Object.entries(countDup(mainDeck.map((c) => c.name))).sort(([, a], [, b]) => b - a)
            )

            embed.addFields(
                // Deck count
                {
                    name: "Draw Percentage",
                    value:
                        "```\n" +
                        Object.keys(deckDup)
                            .map(
                                (c) =>
                                    `${deckDup[c]}x | ${c} (${toPercent(deckDup[c] / mainDeck.length)}%, ${toPercent(
                                        (deckDup[c] / mainDeck.length) *
                                            [...Array(3).keys()].reduce(
                                                (acc, x) =>
                                                    acc +
                                                    [...Array(x).keys()].reduce(
                                                        (acc, y) =>
                                                            acc *
                                                            ((mainDeck.length - deckDup[c] - y) /
                                                                (mainDeck.length - y - 1)),
                                                        1
                                                    ),
                                                0
                                            )
                                    )}%)`
                            )
                            .join("\n") +
                        "\n```",
                },
                // Hand combination
                {
                    name: "Starting hand",
                    value: `Possible starting hand permutation: ${
                        possibleMainHandCombinations.length
                    }\nPossible unique starting hand combination: ${
                        new Set(possibleMainHandCombinations.map((h) => h.join(","))).size
                    }\n`,
                    inline: true,
                },
                // Common hand combination
                {
                    name: "Common Hand combination",
                    value: `${(() => {
                        const temp = Object.entries(
                            countDup(possibleMainHandCombinations.map((h) => h.join(",")))
                        ).sort(([, a], [, b]) => b - a)
                        return `1. ${temp[0][0]} (${toPercent(
                            temp[0][1] / possibleMainHandCombinations.length
                        )}%)\n2. ${temp[1][0]} (${toPercent(temp[1][1] / possibleMainHandCombinations.length)}%)\n3. ${
                            temp[2][0]
                        } (${toPercent(temp[2][1] / possibleMainHandCombinations.length)}%)`
                    })(possibleMainHandCombinations)}`,
                    inline: true,
                },
                // Deck composition
                //TODO clean this up
                {
                    name: "Deck Composition",
                    value: `Blood count: ${mainDeck.reduce((acc, c) => {
                        if (c.blood_cost) return acc + 1
                        else return acc
                    }, 0)} (${toPercent(
                        mainDeck.reduce((acc, c) => {
                            if (c.blood_cost) return acc + 1
                            else return acc
                        }, 0) / mainDeck.length
                    )}%)\nBone count: ${mainDeck.reduce((acc, c) => {
                        if (c.bone_cost) return acc + 1
                        else return acc
                    }, 0)} (${toPercent(
                        mainDeck.reduce((acc, c) => {
                            if (c.bone_cost) return acc + 1
                            else return acc
                        }, 0) / mainDeck.length
                    )}%)\nEnergy count: ${mainDeck.reduce((acc, c) => {
                        if (c.energy_cost) return acc + 1
                        else return acc
                    }, 0)} (${toPercent(
                        mainDeck.reduce((acc, c) => {
                            if (c.energy_cost) return acc + 1
                            else return acc
                        }, 0) / mainDeck.length
                    )}%)\nMox count: ${mainDeck.reduce((acc, c) => {
                        if (c.mox_cost) return acc + 1
                        else return acc
                    }, 0)} (${toPercent(
                        mainDeck.reduce((acc, c) => {
                            if (c.mox_cost) return acc + 1
                            else return acc
                        }, 0) / mainDeck.length
                    )}%)`,
                    inline: true,
                },
                // Deck stat
                //TODO clean up
                {
                    name: "Deck Stat",
                    value: `Maximum Blood cost: ${mainDeck.reduce(
                        (acc, c) => acc + getBlood(c),
                        0
                    )}\nAverage Blood cost: ${average(
                        ...mainDeck.filter((c) => c.blood_cost).map((c) => getBlood(c))
                    ).toFixed(1)}\nMaximum Bone cost: ${mainDeck.reduce(
                        (acc, c) => acc + getBone(c),
                        0
                    )}\nAverage Bone cost: ${average(
                        ...mainDeck.filter((c) => c.bone_cost).map((c) => getBone(c))
                    ).toFixed(1)}\nAverage Energy cost: ${average(
                        ...mainDeck.filter((c) => c.energy_cost).map((c) => c.energy_cost)
                    ).toFixed(1)} (On average it take ${Math.round(
                        average(...mainDeck.filter((c) => c.energy_cost).map((c) => c.energy_cost))
                    )} turns to play a energy card)`,
                    inline: true,
                }
            )

            console.log()
            await interaction.editReply({
                embeds: [embed],
            })
        } else if (commandName == "add-vanilla") {
            if (!isPerm(interaction)) {
                await interaction.reply("no")
                return
            }
            try {
                setsData.vanilla.cards[JSON.parse(options.getString("card-json")).name] = (() => {
                    const json = JSON.parse(options.getString("card-json"))
                    json.noArt = true
                    return json
                })()
                fs.writeFileSync("./extra/vanilla.json", JSON.stringify(setsData.vanilla))
                await interaction.reply("Card added")
            } catch (err) {
                await interaction.reply(`\`\`\`\n${err}\`\`\``)
            }
        }
    } else if (interaction.isButton()) {
        if (interaction.customId == "retry") {
            // clear everything that was on the message.
            await interaction.update({
                embeds: [],
                files: [],
            })
            await interaction.editReply(
                await messageSearch(
                    await getMessage(interaction.channel, interaction.message.reference.messageId),
                    true
                )
            )
        } else if (interaction.customId == "removeCache") {
            await interaction.showModal(
                new ModalBuilder()
                    .setTitle("Removing portrait cache")
                    .setCustomId("removeCache")
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setLabel("WARNING")
                                .setValue('If you don\'t know what this button do press "Cancel"')
                                .setCustomId("no")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setLabel("Enter card name")
                                .setPlaceholder("Name is not case sensitive but must be exact")
                                .setCustomId("name")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setLabel("Enter internal set name")
                                .setPlaceholder("Set name is case sensitive and must be exact")
                                .setCustomId("set")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    )
            )
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId == "removeCache") {
            try {
                const card = fetchCard(
                    interaction.fields.getTextInputValue("name").toLowerCase(),
                    interaction.fields.getTextInputValue("set"),
                    true
                )
                if (!card) throw Error("Missing Card")
                delete portraitCaches[card.url]
                fs.writeFileSync("./extra/caches.json", JSON.stringify(portraitCaches, null, 4))
                await interaction.reply({
                    content: "Cache removed",
                    ephemeral: true,
                })
            } catch {
                await interaction.reply({
                    content: "Invalid card name or set name",
                    ephemeral: true,
                })
            }
        }
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId == "pollSelect") {
            let fullPollData = require("./extra/poll.json")
            let pollData = fullPollData[interaction.message.id]
            if (pollData.alreadyVote.includes(interaction.user.id)) {
                await interaction.reply({
                    content: "You already voted",
                    ephemeral: true,
                })
            } else {
                pollData.optionResult[interaction.values[0]].amount++
                pollData.alreadyVote.push(interaction.user.id)
                await interaction.reply({
                    content: "Vote Success",
                    ephemeral: true,
                })
            }
            fs.writeFileSync("./extra/poll.json", JSON.stringify(fullPollData), "utf8")
        }
    }
})

// on messages send
client.on(Events.MessageCreate, async (message) => {
    if (message.author.id === clientId) return
    if (message.content.toLowerCase().startsWith("would you kindly")) {
        try {
            const command = message.content.slice(17)

            if (command.startsWith("calculate hand percentage of ")) {
                const num = command
                    .replace("calculate hand percentage of ", "")
                    .split(" ")
                    .map((n) => parseInt(n))
                await message.reply(
                    `There would be a ${toPercent(
                        (num[0] / num[1]) *
                            [...Array(num[2]).keys()].reduce(
                                (acc, x) =>
                                    acc +
                                    [...Array(x).keys()].reduce(
                                        (acc, y) => acc * ((num[1] - num[0] - y) / (num[1] - y - 1)),
                                        1
                                    ),
                                0
                            )
                    )}% chance if there were ${num[0]} copies in a ${num[1]} cards deck and the starting hand is ${
                        num[2]
                    }`
                )
            } else if (command.startsWith("eval") && message.author.id == "601821309881810973") {
                await message.reply(`${eval(command.replace("eval", ""))}`)
            } else if (command.startsWith("check if tunnel is online")) {
                http.get("http://localtunnel.me", async (_) => {
                    await message.reply(
                        "Tunnel is up and running. If you have problem connecting, restart the game and try again"
                    )
                }).on("error", async (_) => {
                    await message.reply(
                        "I can't connect to tunnel but you can check it yourself [here](https://isitdownorjust.me/localtunnel-me/)"
                    )
                })
            } else if (command.startsWith("roll a d")) {
                await message.reply(
                    `You got a ${Math.floor(parseInt(command.replace("roll a d", "")) * Math.random()) + 1}`
                )
            } else if (command.startsWith("flip a coin")) {
                await message.reply(`You got ${Math.floor(2 * Math.random()) == 0 ? "Head" : "Tail"}`)
            } else if (
                command.startsWith("cal") &&
                (message.guildId == "994573431880286289" ||
                    message.guildId == "1028530290727063604" ||
                    message.guildId == "913238101902630983")
            ) {
                if (command.replace("cal", "").replaceAll("\n", ";").trim() == "9 + 10") {
                    await message.reply("21 duh")
                    return
                }
                await message.reply(`${limitedEvaluate(command.replace("cal", "").replaceAll("\n", ";").trim())}`)
            } else if (command.startsWith("remind me in")) {
                const num = command.replace("remind me in", "")
                const ms = num.endsWith("h")
                    ? parseInt(num.replace("h", "")) * 60 * 60 * 1000
                    : num.endsWith("m")
                    ? parseInt(num.replace("m", "")) * 60 * 1000
                    : num.endsWith("s")
                    ? parseInt(num.replace("s", "")) * 1000
                    : 1000
                await message.reply(`Reminder will go off <t:${((Date.now() + ms) / 1000).toFixed()}:R>`)
                await sleep(ms)
                await message.reply("HEY TIME UP BITCH")
            } else if (command.startsWith("cipher")) {
                const cipherType = command.replace("cipher ", "")
                if (cipherType.startsWith("atbash")) {
                    const alphabet = "abcdefghijklmnopqrstuvwxyz"
                    await message.reply(
                        cipherType
                            .replace("atbash ", "")
                            .split("")
                            .map((c) =>
                                alphabet.indexOf(c) != -1
                                    ? alphabet.split("").reverse().join("")[alphabet.indexOf(c)]
                                    : alphabet.toUpperCase().indexOf(c) != -1
                                    ? alphabet.toUpperCase().split("").reverse().join("")[
                                          alphabet.toUpperCase().indexOf(c)
                                      ]
                                    : c
                            )
                            .join("")
                    )
                }
            } else if (command.startsWith("scryfall")) {
                const query = command.replace("scryfall", "")
                await message.reply(`[Scryfall query](https://scryfall.com/search?q=${encodeURI(query)})`)
            } else {
                await message.reply(randomChoice(["Yes", "Sure", "Maybe", "No", "Never"]))
            }
        } catch (error) {
            await message.reply(error.message)
        }
    } else {
        messageSearch(message)
    }
})

client.login(token) // login the bot
