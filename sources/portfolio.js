import cheerio from 'cheerio';
import asyncGetRequest from './std.js';

async function getPortfolio() {
    let beerFestivals = await getPortfolioCollectionHightCount("beer-festivals");
    let hackathons = await getPortfolioCollectionHightCount("hackathons");
    return { beerFestivals, hackathons };
}

async function getPortfolioCollectionHightCount(collectionName) {
    let html = await asyncGetRequest(`https://seanomahoney.com/timeline/collection/${collectionName}`, {});
    const $ = cheerio.load(html);
    return $("#count").text().replace(" Highlights", "");
}

export default getPortfolio;