var imfJson = {
	ruleset: "Inscryption Redux",
	cards: [],
}

async function load() {
	let cardRaw
	await fetch(
		`https://raw.githubusercontent.com/UwUMacaroniTime/inscr_onln_redux/main/JSON/data.json`
	)
		.then((res) => res.json())
		.then((json) => (cardRaw = json))
	for (let card of cardRaw.cards) {
		card.sigils.forEach((sigil) => {
			sigil["description"] = sigil["desc"] + "\n"
			delete sigil["desc"]
			delete sigil["icon"]
		})
		card["portrait"] = card["portrait"].replace("res://", "")
		card["pixport_url"] =
			`https://github.com/UwUMacaroniTime/inscr_onln_redux/raw/main/${card.portrait}`.replaceAll(
				" ",
				"%20"
			)
		delete card["portrait"]
		card["heat_cost"] = card["heat_csot"]
		delete card["heat_csot"]

		imfJson.cards.push(card)
	}
	return imfJson
}

module.exports = {
	load,
}
