const k = require('kijiji-scraper')

const params = {
	locationId: 1700183,
	categoryId: 644,
	sortByName: 'dateDesc',
	adType: 'OFFERED',
}
//---------------scrape ads from kijiji results and add to db if its not already added---------------

async function scrape(con, client) {
	try {
		const ads = await k.search(params)
		console.log('scraping!')
		for (let i = 0; i < ads.length; ++i) {
			//CHECK IF AD IS BAD
			if (ads[i].id.includes('cas')) {
				return console.log('AD IS BAD! ' + ads[i].id)
			}
			//CHECK IF LISTING ALREADY RECORDED
			con.query(`SELECT * from listings WHERE ad_id = '${ads[i].id}'`, (err, results) => {
				if (err) throw err
				if (results.length == 1) {
					return console.log('AD ALREADY ADDED! ' + ads[i].id)
				} else {
					//IF IT'S NOT ALREADY ADDED, RECORD NEW AD TO DB
					const images = JSON.stringify(ads[i].images)

					ads[i].description = ads[i].description.replace(/'/g, "\\'")
					ads[i].title = ads[i].title.replace(/'/g, "\\'")

					//CHECK FOR FREE?
					if (ads[i].attributes.price == 0) {
						console.log('AD PRICE IS ' + ads[i].attributes.price)
					}

					con.query(
						`INSERT INTO listings (title, description, date, pictures, price, location, url, ad_id, active) VALUES ('${ads[i].title}', '${ads[i].description}', '${ads[i].date}', '${images}', ${ads[i].attributes.price}, '${ads[i].attributes.location}', '${ads[i].url}', '${ads[i].id}', 'active') ON DUPLICATE KEY UPDATE ad_id = '${ads[i].id}'`,
						(err, results) => {
							if (err) throw err
						}
					)
					console.log('added new ad! ID: ' + ads[i].id)
				}
			})
		}
		console.log(ads[1].attributes.visits)
	} catch (err) {
		throw err
	}
}

module.exports = scrape
