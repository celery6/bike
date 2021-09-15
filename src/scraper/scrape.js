const k = require('kijiji-scraper')
const dotenv = require('dotenv')
dotenv.config()
const params = {
	locationId: 1700183,
	categoryId: 644,
	sortByName: 'dateDesc',
	adType: 'OFFERED',
}

async function scrape(con) {
	try {
		const ads = await k.search(params)
		console.log('hihihi!')
		for (let i = 0; i < ads.length; ++i) {
			//CHECK IF AD IS BAD
			if (ads[i].id.includes('cas')) {
				return console.log('AD IS BAD! ' + ads[i].id)
			}

			const images = JSON.stringify(ads[i].images)
			if (ads[i].attributes.price == undefined) ads[i].attributes.price = 999999
			ads[i].description = ads[i].description.replace(/'/g, "\\'")
			ads[i].title = ads[i].title.replace(/'/g, "\\'")

			//CHECK IF LISTING ALREADY RECORDED
			con.query(`SELECT * from listings WHERE ad_id = '${ads[i].id}'`, (err, results) => {
				if (err) throw err
				if (results.length == 1) {
					return console.log('AD ALREADY ADDED! ' + ads[i].id)
				} else {
					//IF IT DOESNT EXIST, RECORD NEW AD
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
	} catch (err) {
		throw err
	}
}

module.exports = scrape
