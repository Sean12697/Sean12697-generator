require('dotenv').config();
const request = require('request');
const cheerio = require('cheerio');
const fs = require("fs");
const mustache = require('mustache');

main();

async function main() {
    let template = fs.readFileSync("about.md", "utf8");
    let beerFestivals = await getPortfolioCollectionHightCount("beer-festivals");
    let hackathons = await getPortfolioCollectionHightCount("hackathons");
    let untappdProfileData = await asyncGetRequest(`https://api.untappd.com/v4/user/info/CraftBeerSean?client_id=${process.env.UNTAPPD_CLIENT_ID}&client_secret=${process.env.UNTAPPD_CLIENT_SECRET}`, {});
    let date_time_now = (new Date()).toUTCString();

    let renderedOutput = mustache.render(template, { 
        beer_festivals_val: beerFestivals,
        hackathons_val: hackathons,
        beer_checkins_val: JSON.parse(untappdProfileData).response.user.stats.total_beers,
        date_time_now
    });

    fs.writeFileSync("render.md", renderedOutput, 'utf8');
}

async function getPortfolioCollectionHightCount(collectionName) {
    let html = await asyncGetRequest(`https://seanomahoney.com/timeline/collection/${collectionName}`, {});
    const $ = cheerio.load(html);
    return $("#count").text().replace(" Highlights", "");
}

async function asyncGetRequest(url, headers) {
    return new Promise(resolve => {
        request({ method: "GET", url, headers }, function (error, response) {
            if (error) throw new Error(error);
            resolve(response.body);
          });
          
    });
}

