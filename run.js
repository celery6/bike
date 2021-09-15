const CronJob = require('cron').CronJob
const mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config()
const scrape = require('./src/scraper/scrape')
const check = require('./src/scraper/check')
const con = mysql.createConnection({
	host: `${process.env.HOST}`,
	user: 'scraper',
	password: `${process.env.PASSWORD}`,
	database: 'bikes',
	port: 3306,
})

con.connect((err) => {
	if (err) {
		console.error('mysql error connecting: ' + err)
		return
	}
	console.log('mysql connected YEAAAAAAAAAAAAAHH!!!!!')
})

const job = new CronJob(`1 */38 * * * *`, function () {
	scrape(con)
	check(con)
	const theDate = new Date()
	console.log('DONE! ' + theDate)
})

job.start()
console.log('CRON JOB RUNNING NOW!')
