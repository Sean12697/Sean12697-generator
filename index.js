require('dotenv').config();
const request = require('request');
const cheerio = require('cheerio');
const fs = require("fs");

main();

async function main() {
    let beerFestivals = 16; // await getPolyworksCollectionHightCount("sean12697", "1081961");
    let hackathons = 27; // await getPolyworksCollectionHightCount("sean12697", "1081458");
    let untappdProfileData = await asyncGetRequest(`https://api.untappd.com/v4/user/info/CraftBeerSean?client_id=${process.env.UNTAPPD_CLIENT_ID}&client_secret=${process.env.UNTAPPD_CLIENT_SECRET}`, {});
    let date_time_now = (new Date()).toTimeString();

    appendValuesToMdFile({ 
        beer_festivals_val: beerFestivals,
        hackathons_val: hackathons,
        beer_checkins_val: JSON.parse(untappdProfileData).response.user.stats.total_checkins,
        date_time_now
    }, "about.md", "render.md");
}

function appendValuesToMdFile(obj, fileName, newFileName) {
    if (newFileName == undefined) newFileName = fileName;
    let fileContent = fs.readFileSync(fileName, "utf8");
    Object.keys(obj).map(key => {
        fileContent = fileContent.replace(key, obj[key]);
    }); fs.writeFileSync(newFileName, fileContent);
}

async function getPolyworksCollectionHightCount(user, collectionId) {
    let html = await asyncGetRequest(`https://www.polywork.com/${user}/collections/${collectionId}`, {});
    const $ = cheerio.load(html);
    return $(".list-inline li:nth-child(3)").text().replace(" Highlights", "");
}

async function asyncGetRequest(url, headers) {
    return new Promise(resolve => {
        request({ method: "GET", url, headers }, function (error, response) {
            if (error) throw new Error(error);
            resolve(response.body);
          });
          
    });
}

