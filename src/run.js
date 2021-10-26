const CronJob = require('cron').CronJob
const mysql = require('mysql')
const scrape = require('./scraper/scrape')
const check = require('./scraper/check')
const bot = require('./bot/bot')
const path = require('path')
require('dotenv').config({ path: '../.env' })
const { Client, Intents } = require('discord.js')

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
const con = mysql.createConnection({
	host: `localhost`,
	user: 'bikes',
	password: `${process.env.PASSWORD}`,
	database: 'bikes',
})

async function run() {
	bot(process.env.TOKEN)

	con.connect((err) => {
		if (err) return console.error('mysql error connecting!!!!! ' + err)
		console.log('mysql connected YEAAAAAAAAAAAAAHH!!!!!')
	})

	const job = new CronJob(`1 */20 * * * *`, function () {
		scrape(con)
		check(con)
		const theDate = new Date()
		console.log('DONE! ' + theDate)
	})
	job.start()
	console.log('CRON JOB RUNNING NOW!')

	//await scrape(con, 'client')
	await check(con, 'client')
}

run()
