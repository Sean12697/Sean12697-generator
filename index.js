import dotenv from 'dotenv';
import fs from 'fs';
import mustache from 'mustache';
import getPortfolio from './sources/portfolio.js';
import getUntappdData from './sources/untappd.js';

main();

async function main() {
    dotenv.config();
    let template = fs.readFileSync("about.md", "utf8");

    let portfolioData = await getPortfolio();
    let untappdData = await getUntappdData(process.env.UNTAPPD_CLIENT_ID, process.env.UNTAPPD_CLIENT_SECRET);
    
    let date_time_now = (new Date()).toUTCString();

    let renderedOutput = mustache.render(template, { 
        ...portfolioData,
        ...untappdData,
        date_time_now
    });

    fs.writeFileSync("render.md", renderedOutput, 'utf8');
}