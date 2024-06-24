# MagpieTutor
<a href="https://discord.com/api/oauth2/authorize?client_id=1066417513115697275&permissions=137439333440&scope=applications.commands%20bot">
        <img src="https://img.shields.io/badge/Invite_the_Bot-blue"
            alt="Invite the Bot">
</a>

Scryfall bot but for Inscryption. Currently the bot can look up card in the following [format/set](https://github.com/Mouthless-Stoat/MagpieTutor/wiki/Searching#set-code)

IF you have any request for new set send me a message on discord. `mouthed_stoat`.

## Table of Content
- [MagpieTutor](#magpietutor)
  - [Table of Content](#table-of-content)
  - [How to host the bot yourself](#how-to-host-the-bot-yourself)
  - [Bot Require Permission](#bot-require-permission)
  - [Todo List](#todo-list)
  - [Plan for next update](#plan-for-next-update)

## How to host the bot yourself
If you know how to set up a discord bot with discord.js already, then download all the package with `npm setup`, then created a `config.json` with these information: 
```json
{"clientId":"Your client ID here","token":"Your Bot's Token here"}  
```
And running `npm start` should start the bot

If you don't know how to setup a discord bot follow these step:
1. Download [Node](https://nodejs.org/en/)
2. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
3. Click on `New Application` in the top right. Give the Application a name (This is not the name of your bot but it recommend to make it the same or similar name as your bot), accept the TOS and create it.
4. Click on the `Bot` menu and choose `Add Bot`, you can change the name of the bot if you want here.
5. Click the `Copy` button below `Token`.
6. Click on the `OAuth2` menu and choose `URL Generator` choose `bot` and `application.commands` option.
6. Make sure the following setting is disabled or else you can't get the link! ![image](https://github.com/SaxbyMod/NotionAssets/assets/102002463/38f0f160-7a8e-4a79-a193-084002577f3c)
7. In the `Bot Permission` section and choose `Administrator`(If you want a more specific list of permission go to). Now you can click `Copy` at the very bottom to get the bot.invite link. **You must invite the bot to a server for future steps**.
8. Now download this repository, unzip the folder if it a zip file.
9. Make a `config.json` file, in there type the following: 
```json
{"clientId":"Your client ID here","token":"Your Bot's Token here"}  
```
10. You can put the token that you copy and replace the text `Your Bot Token here`
11. Go into your discord client `Setting` > `Advance` and turn on `Developer Mode`
12. You can now copy the bot client ID by right clicking and select `Copy ID`. You can replace the text `Your Client ID here` in `config.json` with this ID. Save the file if you haven't already. 
13. Right click and choose `Open in Terminal` option or go to the path text box and type in `cmd`.
14. Run the command `npm run setup` to install all the necessary package for the bot and setup the slash commands.
15. Finally run `npm run start` to host the bot.

If you have any problem ask me on Discord my DM should be open. `mouthless_stoat`

## Bot Require Permission
- Read Messages/View Channels: The Bot needs to see messages to do look up
- Send Messages: The Bot needs to send message to reply
- Embed Links: The Bot needs embed for card display and other function
- Attach Files: The Bot needs to attach file or images for card portrait and [/guess-the-card](https://github.com/Mouthless-Stoat/MagpieTutor/wiki/Command#guess-the-card-command)
- Read Message History: The Bot needs to see old messages for [/retry](https://github.com/Mouthless-Stoat/MagpieTutor/wiki/Command#retry-command) to work
- Use External Emoji: The Bot needs to use external emoji for cost and number emoji

## Todo List
- More advance stuff for query (or, etc.)
- Deck submission that give a id to be recall
- Ruleset submission that give id to be recall
- Theme submission that give id to be recall
- Query support for redux
- Ranking/elo system
- A website version??

## Plan for next update
- Search all set modifier
- Energy curve for deck analysis
- Cost ratio for deck analysis
- Bone counting for deck analysis
