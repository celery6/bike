const k = require('kijiji-scraper')

//---------------go through all active ads in db and check if its still active or changed price---------------

async function check(con, client) {
	console.log('cehcking!')
	con.query(`SELECT * FROM listings WHERE active = 'active'`, async (err, rows) => {
		for (let i = 0; i < rows.length; ++i) {
			try {
				//IF AD EXISTS (NO ERR), CHECK FOR PRICE CHANGE
				const ad = await k.Ad.Get(rows[i].url)
				if (ad.attributes.price == undefined) ad.attributes.price = 999999

				if (rows[i].price !== ad.attributes.price) {
					const difference = ad.attributes.price - rows[i].price
					con.query(
						`INSERT INTO price_changes (ad_id, price_before, price_after, change_diff, date) VALUES (${ad.id}, ${rows[i].price}, ${ad.attributes.price}, ${difference}, now())`,
						(err, results) => {
							if (err) throw err
							console.log('recorded price change! ID: ' + ad.id)
						}
					)
					con.query(`UPDATE listings SET price = ${ad.attributes.price} WHERE ad_id = '${ad.id}'`)
				}
			} catch (err) {
				if (err.toString().includes('does not exist')) {
					//CHANGE ACTIVE AD TO INACTIVE IN DB
					const inactive_date = new Date()
					con.query(
						`UPDATE listings SET active = 'inactive', inactive_date = '${inactive_date}' WHERE ad_id = '${rows[i].ad_id}'`
					)
					console.log(`AD DOES NOT EXIST! AD ID: ${rows[i].ad_id} IS NOW INACTIVE!`)
				} else {
					console.log(rows[i].url)
					throw err
				}
			}
		}
	})
	console.log('done chekcing!')
}

module.exports = check
