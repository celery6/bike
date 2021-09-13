const CronJob = require('cron').CronJob
const mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config()
const scrape = require('./a')

const con = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
})

con.connect((err) => {
	if (err) {
		console.error('mysql error connecting: ' + err.stack)
		return
	}
	console.log('mysql connected YEAAAAAAAAAAAAAHH!!!!!')
})

const job = new CronJob('*/1 * * * * *', function () {})

job.start()
yes(con)
console.log('CRON JOB RUNNING NOW!')
