const fetch = require("node-fetch")

var imfJson = {
    ruleset: "Augmented",
    cards: [],
    sigils: {},
}

async function load() {
    let cardsRaw
    let sigilRaw
    await fetch(`https://opensheet.elk.sh/1tvTXSsFDK5xAVALQPdDPJOitBufJE6UB_MN4q5nbLXk/Cards`)
        .then((res) => res.json())
        .then((json) => {
            cardsRaw = json
        })

    await fetch(`https://opensheet.elk.sh/1tvTXSsFDK5xAVALQPdDPJOitBufJE6UB_MN4q5nbLXk/Sigils`)
        .then((res) => res.json())
        .then((json) => {
            sigilRaw = json
        })
    cardsRaw.pop()
    for (let card of cardsRaw) {
        let cardFormated = {}
        if (Object.keys(card).length == 0) continue
        cardFormated["name"] = card["Card Name"]
        cardFormated["temple"] = card["Temple"]
        cardFormated["tier"] = card["Tier"]

        // parsing cost
        card["Cost"] = card["Cost"]
            .replace("bones", "bone")
            .replace("sapphires", "sapphire")
            .replace("rubies", "ruby")
            .replace("prisms", "prism")
        for (let cost of card["Cost"].split("+")) {
            cost = cost.trim().toLowerCase()
            let temp = cost.split(" ")
            if (cost.includes("shattered")) {
                if (!cardFormated["shattered"]) cardFormated["shattered"] = []
                for (let i = 0; i < temp[0]; i++) {
                    cardFormated["shattered"].push(`shattered_${temp[2]}`)
                }
            } else if (["sapphire", "ruby", "emerald", "prism"].some((i) => cost.includes(i))) {
                if (!cardFormated["mox"]) cardFormated["mox"] = []
                for (let i = 0; i < temp[0]; i++) {
                    cardFormated["mox"].push(temp[1])
                }
            } else if (temp.length > 0) {
                cardFormated[temp[1]] = parseInt(temp[0])
            }
        }

        // parsing health and power
        cardFormated["health"] = parseInt(card["♥"])
        cardFormated["attack"] = parseInt(card["🗡"] == "X" ? 0 : card["🗡"])
        cardFormated["sigils"] = card["Sigils"] ? card["Sigils"].split(", ") : []

        if (card["Token"]) cardFormated["token"] = card["Token"]
        if (card["Traits"]) cardFormated["traits"] = card["Traits"] ? card["Traits"].split(", ") : []
        if (card["Tribes"]) cardFormated["tribes"] = card["Tribes"]

        cardFormated["description"] = card["Flavor Text"]

        cardFormated["footnote"] = `This card art was made by ${card["Credit"]}.\nLast Edited: ${card["edited"]}`
        // console.log(cardFormated["sigils"], !cardFormated["sigils"])
        if (!cardFormated["sigils"] || cardFormated["sigils"].length <= 0) {
            delete cardFormated["sigils"]
        }
        cardFormated["art"] = card["Art"]
        if (card["Art"] == "Not Done") {
            cardFormated["noArt"] = true
        }

        cardFormated[
            "pixport_url"
        ] = `https://github.com/answearingmachine/card-printer/raw/main/dist/printer/assets/art/${cardFormated.name.replaceAll(
            " ",
            "%20"
        )}.png`

        imfJson.cards.push(cardFormated)
    }

    for (sigil of sigilRaw) {
        if (sigil["Text"]) imfJson.sigils[sigil["Name"]] = sigil["Text"].replaceAll("\n", "")
    }

    imfJson.cards.push({
        name: "Maid Goat",
        attack: 1,
        health: 3,
        blood: 2,
        sigils: ["Worthy Sacrifice", "Morsel"],
        noArt: true,
    })
    return imfJson
}

module.exports = {
    load,
}
