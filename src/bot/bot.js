const { Client, Intents } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
require('dotenv').config({ path: '.../.env' })

async function bot(token) {
	client.login(token)
	client.once('ready', () => {
		console.log('uwu botbot is here')
	})
}

module.exports = bot
