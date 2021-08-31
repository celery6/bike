import k from 'kijiji-scraper'
import mysql from 'mysql'

var con = mysql.createConnection({
    host: '192.168.1.144',
    user: 'scraper',
    password: 'Mysql5,./,.',
    database: 'bikes'
});

con.connect(err => {
    if (err) {
        console.error('mysql error connecting: ' + err.stack);
        return;
    }
    console.log('mysql connected YEAAAAAAAAAAAAAHH!!!!!');
});

const params = {
    locationId: 1700183,  // Same as kijiji.locations.ONTARIO.OTTAWA_GATINEAU_AREA.OTTAWA
    categoryId: 644,  // Same as kijiji.categories.CARS_AND_VEHICLES
    sortByName: "dateDesc",  // Show the cheapest listings first
    adType: "OFFERED"
};

async function yes() {
    try {
        const ads = await k.search(params);
        for (let i = 0; i < ads.length; ++i) {
            const images = JSON.stringify(ads[i].images)
            if (ads[i].attributes.price == undefined) ads[i].attributes.price = 999999;

            ads[i].description = ads[i].description.replace(/'/g, "\\'");
            ads[i].title = ads[i].title.replace(/'/g, "\\'");

            con.query(`INSERT INTO listings (title, description, date, pictures, price, location, url, ad_id) values ('${ads[i].title}', '${ads[i].description}', '${ads[i].date}', '${images}', ${ads[i].attributes.price}, '${ads[i].attributes.location}', '${ads[i].url}', '${ads[i].id}')`, (err, results) => {
                if (err) throw err;
            })

        }

    }
    catch (err) {
        throw err;
    }
}

(async function run() {
    await yes();
    console.log('i did it! added all the stuff to db YAYEAAEHAEHYAHY!')
})();
