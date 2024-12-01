import dotenv from 'dotenv';
import fs from 'fs';
import mustache from 'mustache';
import getPortfolio from './sources/portfolio.js';
import getUntappdData from './sources/untappd.js';
import fetchGames from './sources/steam.js';

main();

async function main() {
    dotenv.config();
    let template = fs.readFileSync("about.md", "utf8");

    let portfolioData = await getPortfolio();
    let untappdData = await getUntappdData(process.env.UNTAPPD_CLIENT_ID, process.env.UNTAPPD_CLIENT_SECRET);
    let steamData = await fetchGames("76561198101964519", "394AAA0A8E2A204C0EDF4F199738A483");
    
    let date_time_now = (new Date()).toUTCString();

    let renderedOutput = mustache.render(template, { 
        ...portfolioData,
        ...untappdData,
        ...steamData,
        date_time_now
    });

    fs.writeFileSync("render.md", renderedOutput, 'utf8');
}