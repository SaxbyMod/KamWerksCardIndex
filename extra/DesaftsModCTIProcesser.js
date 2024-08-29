const fetch = require("node-fetch")

var DesaftModCTI = {
    ruleset: "Desaft's Mod (CTI)",
    cards: [],
    sigils: {},
}

async function load() {
    let cardsRaw
    let sigilRaw
    await fetch("https://opensheet.elk.sh/152SuTx1fVc4zsqL4_zVDPx69sd9vYWikc2Ce9Y5vhJE/3")
        .then((res) => res.json())
        .then((json) => {
            cardsRaw = json
        })

    await fetch("https://opensheet.elk.sh/152SuTx1fVc4zsqL4_zVDPx69sd9vYWikc2Ce9Y5vhJE/4")
        .then((res) => res.json())
        .then((json) => {
            sigilRaw = json
        })
        
    cardsRaw.pop()
    for (let card of cardsRaw) {
        let cardFormated = {}
        if (Object.keys(card).length == 0) continue
        cardFormated.name = card["Internal Name"]
        cardFormated.temple = card["Temple"]
        cardFormated.tier = card["Rarity"]
        cardFormated.tribes = card["Tribes"]
        cardFormated.cost = card["Cost"]
        cardFormated.attack = card["Power"]
        cardFormated.health = card["Health"]
        cardFormated.description = card["Flavor"]
        cardFormated.format = card["From"]
        cardFormated.wikipage = card["Wiki-Page"]
        cardFormated.token = card["Token"]

        // Cost Parsing
        card["Cost"] = card["Cost"].replace("Bones", "Bone").replace("Gems", "Mox").replace("Gem", "Mox").replace("Skulls", "Skull").toLowerCase()
        for (let cost of card["Cost"].split(", ")) {
            cost = cost.trim().toLowerCase()
            let temp = cost.split(" ")
            if (cost.includes("shattered")) {
                if (!cardFormated["shattered"]) cardFormated["shattered"] = []
                for (let i = 0; i < temp[0]; i++) {
                    cardFormated["shattered"].push(`shattered_${temp[2]}`)
                }
            } else if (["sapphire", "ruby", "emerald", "prism", "garnet", "topaz", "amethyst"].some((i) => cost.includes(i))) {
                if (!cardFormated["mox"]) cardFormated["mox"] = []
                for (let i = 0; i < temp[0]; i++) {
                    cardFormated["mox"].push(temp[1])
                }
            } else if (cost.includes("free")) {
                null
            } else if (temp.length > 0) {
                cardFormated[temp[1]] = parseInt(temp[0])
            }
        

        cardFormated.sigils = [
            card["Sigil 1"] ?? "",
            card["Sigil 2"] ?? "",
            card["Sigil 3"] ?? "",
            card["Sigil 4"] ?? "",
        ]
        cardFormated.sigils = cardFormated.sigils.filter(s => s !== "")

        if (cardFormated.sigils.length <= 0) {
            delete cardFormated["sigils"]
        }

        cardFormated.pixport_url = card["Image"]
        DesaftModCTI.cards.push(cardFormated)
    }

    for (sigil of sigilRaw) {
        if (sigil["Description"]) DesaftModCTI.sigils[sigil["Internal Name"]] = sigil["Description"].replaceAll("\n", "")
    }
}
return DesaftModCTI
}

module.exports = {
    load,
}