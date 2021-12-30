const k = require('kijiji-scraper')
const logger = require('../util/logger')

//---------------go through all active ads in db and check if its still active or changed price---------------

async function check(con, client, listings_table, changes) {
	logger.info('cehcking! ' + listings_table)
	con.query(`SELECT * FROM ${listings_table} WHERE active = 'active'`, async (err, rows) => {
		for (let i = 0; i < rows.length; ++i) {
			try {
				//IF AD EXISTS (NO ERR), CHECK FOR PRICE CHANGE
				const ad = await k.Ad.Get(rows[i].url)
				if (ad.attributes.price == undefined) ad.attributes.price = 999999

				if (rows[i].price != ad.attributes.price) {
					const difference = ad.attributes.price - rows[i].price
					con.query(`INSERT INTO ${changes} (ad_id, price_before, price_after, change_diff, date) VALUES (${ad.id}, ${rows[i].price}, ${ad.attributes.price}, ${difference}, now())`, (err, results) => {
						if (err) throw err
						logger.info('recorded price change! ID: ' + ad.id)
					})
					con.query(`UPDATE ${listings_table} SET price = ${ad.attributes.price} WHERE ad_id = '${ad.id}'`)
				}
			} catch (err) {
				if (err.toString().includes('does not exist')) {
					//CHANGE ACTIVE AD TO INACTIVE IN LISTINGS DB
					const inactive_date = new Date()
					con.query(`UPDATE ${listings_table} SET active = 'inactive', inactive_date = '${inactive_date}' WHERE ad_id = '${rows[i].ad_id}'`)
					logger.info(`AD DOES NOT EXIST! AD ID: ${rows[i].ad_id} IS NOW INACTIVE!`)
				} else {
					logger.error(rows[i].url + err)
				}
			}
		}
	})
}
module.exports = check
