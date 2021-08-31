const axios = require("axios")
const cheerio = require("cheerio")

const getStuff = async () => {
    try {
        const response = await axios.get('https://www.kijiji.ca/b-kingston-on/bike/k0l1700183?rb=true&dc=true');
        const html = response.data
        const $ = cheerio.load(html)

        let posts = [];

        $('.regular-ad').not('.third-party').each((i, el) => {
            posts[i] = {};
            posts[i].title = $('.title > a', el).text().trim();
            posts[i].price = $('.price', el).text().trim();
            posts[i].id = $(el).attr('data-listing-id');
            posts[i].location = $('.location > span', el).not('.date-posted').text().trim();
            posts[i].url = 'https://www.kijiji.ca' + $('.title > a', el).attr('href');
            posts[i].date
        })

        console.log(posts[4]);
    }

    catch (err) {
        throw err;
    }
}

getStuff();