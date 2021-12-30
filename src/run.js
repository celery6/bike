const CronJob = require('cron').CronJob
const mysql = require('mysql2')
const scrape = require('./scraper/scrape')
const check = require('./scraper/check')
const bot = require('./bot/bot')
const path = require('path')
const logger = require('./util/logger')
require('dotenv').config({ path: '../.env' })
const { Client, Intents } = require('discord.js')

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
const con = mysql.createConnection({
	host: `localhost`,
	user: 'scraper',
	password: `${process.env.PASSWORD}`,
	database: 'bike',
})

const bikeParams = {
	locationId: 1700183,
	categoryId: 644,
	sortByName: 'dateDesc',
	adType: 'OFFERED',
}
const allParams = {
	locationId: 0,
	categoryId: 0,
	sortByName: 'dateDesc',
	adType: 'OFFERED',
}
bot(process.env.TOKEN)

con.connect((err) => {
	if (err) return console.error('mysql error connecting!!!!! ' + err)
	logger.info('mysql connected YEAAAAAAAAAAAAAHH!!!!!')
})

const job = new CronJob(`1 */1 * * * *`, function () {
	scrape(con, 'client', bikeParams, 'listings')
	scrape(con, 'client', allParams, 'all_listings')
	check(con, 'client', 'listings', 'price_changes')
	check(con, 'client', 'all_listings', 'all_price_changes')
})
job.start()
logger.info('CRON JOB RUNNING NOW!')
scrape(con, 'client', bikeParams, 'listings')
scrape(con, 'client', allParams, 'all_listings')
check(con, 'client', 'listings', 'price_changes')
check(con, 'client', 'all_listings', 'all_price_changes')

//run()
