const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { clientId, token } = require("../config.json")

const commands = [
    new SlashCommandBuilder().setName("set-code").setDescription("Show all the set code"),
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("If the bot response pong it online and should be working"),
    new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Force the bot to reset")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    new SlashCommandBuilder()
        .setName("draft")
        .setDescription("Open packs and draft a deck")
        .addStringOption((option) =>
            option
                .setName("set")
                .setDescription("Which set do you want to pull card from")
                .setChoices(
                    { name: "Competitive", value: "competitive" },
                    { name: "Eternal", value: "eternal" },
                    { name: "Vanilla", value: "vanilla" },
                    { name: "Mr.Egg", value: "mr.egg" },
                    { name: "Augmented", value: "augmented" }
                )
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option.setName("size").setDescription("The deck size (how many pack do you want to open)").setMinValue(1)
        ),
    new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Echo text")
        .addStringOption((option) => option.setName("text").setDescription("The text to echo back").setRequired(true))
        .addChannelOption((option) => option.setName("channel").setDescription("The channel to echo into"))
        .addStringOption((option) => option.setName("message").setDescription("The message id to reply to"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    new SlashCommandBuilder()
        .setName("deck-sim")
        .setDescription("Simulate a deck, you can draw card test starting hand, etc")
        .addStringOption((option) =>
            option.setName("set").setDescription("Which set this deck file was made in").addChoices(
                { name: "Competitive", value: "competitive", },
                { name: "Eternal", value: "eternal" },
                { name: "Mr.egg", value: "mr.egg" }
            )
        )
        .addAttachmentOption((option) =>
            option.setName("deck-file").setDescription("The deck file you want to test with")
        )
        .addStringOption((option) =>
            option.setName("deck-list").setDescription("The deck list, put comma between card name")
        )
        .addBooleanOption((option) =>
            option
                .setName("detail")
                .setDescription("Show more detail like card left in deck, card draw percentage, etc")
        ),
    new SlashCommandBuilder()
        .setName("tunnel-status")
        .setDescription("Check the status of the tunnel if it down or not"),
    new SlashCommandBuilder()
        .setName("color-text")
        .setDescription("Give you color text raw input")
        .addStringOption((option) =>
            option.setName("string").setDescription("The string you want to color").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("guess-the-card")
        .setDescription("Minigame where you guess cards")
        .addSubcommand((sub) =>
            sub
                .setName("normal")
                .setDescription("Magpie will send part of a card and you guess it")
                .addStringOption((option) =>
                    option
                        .setName("set")
                        .setDescription("The set where magpie pull card from")
                        .addChoices(
                            { name: "Competitive", value: "competitive" },
                            { name: "Eternal", value: "eternal" },
                            { name: "Vanilla", value: "vanilla" },
                            { name: "Augmented", value: "augmented" },
                            { name: "Magic the Gathering", value: "magic" }
                        )
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("difficulty")
                        .setDescription(
                            "The difficulty you want. Easy is 50%, Normal is 35%, Hard is 25% and VERY FUCKING HARD is 12%"
                        )
                        .addChoices(
                            { name: "Easy", value: 50 },
                            { name: "Normal", value: 35 },
                            { name: "Hard", value: 25 },
                            { name: "VERY FUCKING HARD", value: 12 }
                        )
                )
                .addIntegerOption((option) =>
                    option.setName("size").setDescription("The size of the piece in percentage")
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("scramble")
                .setDescription("Magpie will scramble a portrait up and you guess it")
                .addStringOption((option) =>
                    option
                        .setName("set")
                        .setDescription("The set where magpie pull card from")
                        .addChoices(
                            { name: "Competitive", value: "competitive" },
                            { name: "Eternal", value: "eternal" },
                            { name: "Vanilla", value: "vanilla" },
                            { name: "Augmented", value: "augmented" },
                            { name: "Magic the Gathering", value: "magic" }
                        )
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("difficulty")
                        .setDescription("The difficulty you want.")
                        .addChoices(
                            { name: "Easy", value: "3,2" },
                            { name: "Normal", value: "5,3" },
                            { name: "Hard", value: "7,5" },
                            { name: "Very Hard", value: "9,7" },
                            { name: "IMPOSSIBLE", value: "41,28" }
                        )
                )
                .addStringOption((option) =>
                    option.setName("size").setDescription("The pieces size. Col first then row")
                )
        ),
    new SlashCommandBuilder()
        .setName("retry")
        .setDescription("Let magpie look at a message again in case you fuck up")
        .addStringOption((option) =>
            option.setName("message").setDescription("The message id to retry").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("react")
        .setDescription("React to texts")
        .addStringOption((option) => option.setName("message").setDescription("message").setRequired(true))
        .addStringOption((option) => option.setName("emoji").setDescription("emoji").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    new SlashCommandBuilder()
        .setName("query-info")
        .setDescription("Send a list of all query keyword and how they work"),
    new SlashCommandBuilder().setName("test").setDescription("Testing commands"),
    new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Make a poll")
        .addStringOption((option) => option.setName("question").setDescription("The poll question").setRequired(true))
        .addStringOption((option) =>
            option
                .setName("option")
                .setDescription('The poll option separate by commas(","). Max of 25 option.')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription("Time the poll will run for. put `m` at the end for minute, `s` for second")
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("default-code")
        .setDescription("Default code or codes to apply in front of search if not present")
        .addStringOption((option) =>
            option
                .setName("default-set-code")
                .setDescription(
                    "Default set code to use when not present. What set to be the default when call with [[]]."
                )
                .setMaxLength(3)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("addon-set-code")
                .setDescription("Default set codes to use when not present. What to add on when call with [[]].")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    new SlashCommandBuilder()
        .setName("deck-analysis")
        .setDescription("Analyze and give useful information about a deck")
        .addStringOption((option) =>
            option
                .setName("set")
                .setDescription("Which set this deck file was made in")
                .addChoices(
                    { name: "Competitive", value: "competitive" },
                    { name: "Eternal", value: "eternal" },
                    { name: "Mr.egg", value: "mr.egg" }
                )
                .setRequired(true)
        )
        .addAttachmentOption((option) =>
            option.setName("deck-file").setDescription("The deck file you want to analyze")
        )
        .addStringOption((option) => option.setName("deck-json").setDescription("The deck json you want to analyze")),
    new SlashCommandBuilder()
        .setName("add-vanilla")
        .setDescription("Add vanilla card")
        .addStringOption((option) => option.setName("card-json").setDescription("The card json").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
].map((command) => command.toJSON())

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(token)

//deploy your commands!
;(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`)

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        })

        console.log(`Successfully reloaded ${data.length} application (/) commands.`)
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error)
    }
})()
