import asyncGetRequest from './std.js';

async function getUntappdData(clientId, apiKey) {
    let data = await asyncGetRequest(`https://api.untappd.com/v4/user/info/CraftBeerSean?client_id=${clientId}&client_secret=${apiKey}`, {});
    let response = JSON.parse(data);
    if (response == undefined) console.log("Untappd Error:", response);
    return { beerCheckins: response.response.user.stats.total_beers };
}

export default getUntappdData;