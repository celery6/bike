const k = require('kijiji-scraper')
const mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config()

const params = {
	locationId: 1700183, // Same as kijiji.locations.ONTARIO.OTTAWA_GATINEAU_AREA.OTTAWA
	categoryId: 644, // Same as kijiji.categories.CARS_AND_VEHICLES
	sortByName: 'dateDesc', // Show the cheapest listings first
	adType: 'OFFERED',
}

async function scrape(con) {
	try {
		const ads = await k.search(params)
		for (let i = 0; i < ads.length; ++i) {
			const images = JSON.stringify(ads[i].images)
			if (ads[i].attributes.price == undefined) ads[i].attributes.price = 999999
			ads[i].description = ads[i].description.replace(/'/g, "\\'")
			ads[i].title = ads[i].title.replace(/'/g, "\\'")

			//CHECK IF LISTING ALREADY RECORDED
			con.query(
				`SELECT * from listings WHERE ad_id = '${ads[i].id}'`,
				(err, results) => {
					if (err) throw err
					if (results.length == 1) {
						//CHECK IF THE LISTING PRICE CHANGED
						if (results[0].price !== ads[i].attributes.price) {
							const difference = ads[i].attributes.price - results[0].price
							con.query(
								`INSERT INTO price_changes (ad_id, price_before, price_after, change_diff, date) VALUES (${ads[i].id}, ${results[0].price}, ${ads[i].attributes.price}, ${difference}, now())`,
								(err, results) => {
									if (err) throw err
									console.log('recorded price change! ID: ' + ads[i].id)
								}
							)
						}
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
				}
			)
		}
		console.log('i did it! added all the stuff to db YAYEAAEHAEHYAHY!')
	} catch (err) {
		throw err
	}
}

module.exports = scrape
