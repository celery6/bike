const k = require('kijiji-scraper')
const logger = require('../util/logger')

//---------------scrape ads from kijiji results and add to db if its not already added---------------

async function scrape(con, client, params, table) {
	const ads = await k.search(params)
	logger.info('scraping!')
	for (let i = 0; i < ads.length; ++i) {
		//CHECK IF AD IS BAD
		if (ads[i].id.includes('cas') || ads[i].id.includes('m')) return logger.info('BAD AD! ' + ads[i].id)
		//CHECK IF LISTING ALREADY RECORDED
		con.query(`SELECT * from ${table} WHERE ad_id = '${ads[i].id}'`, (err, results) => {
			if (err) logger.error(err)
			if (results.length == 1) {
				return logger.info('AD ALREADY ADDED! ' + ads[i].id)
			} else {
				//IF IT'S NOT ALREADY ADDED, RECORD NEW AD TO DB
				const images = JSON.stringify(ads[i].images)
				ads[i].description = ads[i].description.replace(/'/g, "\\'")
				ads[i].title = ads[i].title.replace(/'/g, "\\'")
				ads[i].attributes.location = ads[i].attributes.location.replace(/'/g, "\\'")

				con.query(`INSERT INTO ${table} (title, description, date, pictures, price, location, url, ad_id, active, type) VALUES ('${ads[i].title}', '${ads[i].description}', '${ads[i].date}', '${images}', ${ads[i].attributes.price}, '${ads[i].attributes.location}', '${ads[i].url}', '${ads[i].id}', 'active', '${ads[i].attributes.type}') ON DUPLICATE KEY UPDATE ad_id = '${ads[i].id}'`, (err, results) => {
					if (err) logger.error(err)
				})
				logger.info('added new ad! ID: ' + ads[i].id)
			}
		})
	}
}

module.exports = scrape
