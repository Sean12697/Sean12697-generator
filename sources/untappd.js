import asyncGetRequest from './std.js';

async function getUntappdData(clientId, apiKey) {
    let data = await asyncGetRequest(`https://api.untappd.com/v4/user/info/CraftBeerSean?client_id=${clientId}&client_secret=${apiKey}`, {})
    return { beerCheckins: JSON.parse(data).response.user.stats.total_beers };
}

export default getUntappdData;