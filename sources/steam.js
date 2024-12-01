import asyncGetRequest from './std.js';

const API_URL = "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/";
const STORE_API_URL = "https://store.steampowered.com/api/appdetails";

// Helper function to check if a game is adult-only
const isAdultOnly = async (appID) => {
  try {
    const url = `${STORE_API_URL}?appids=${appID}`;
    const response = await asyncGetRequest(url);
    const data = JSON.parse(response);

    if (data[appID]?.success) {
      const descriptors = data[appID].data?.content_descriptors?.ids || [];
      console.log(descriptors)
      return descriptors.includes(3); // Assuming ID 3 corresponds to adult-only
    }
    return false;
  } catch (error) {
    // console.error(`Error checking adult status for appID ${appID}:`, error.message);
    return false; // Assume not adult-only on error
  }
};

// Fetch player games
const fetchGames = async (playerID, apiKey) => {
  try {
    // Fetch recently played games
    const url = `${API_URL}?key=${apiKey}&steamid=${playerID}&count=10`;
    const response = await asyncGetRequest(url);
    const games = JSON.parse(response).response?.games || [];

    // Filter out adult-only games
    const filteredGames = [];
    for (const game of games) {
      const adultOnly = await isAdultOnly(game.appid);
      if (!adultOnly) {
        filteredGames.push(game);
      }
    }

    // Prepare Markdown content
    const markdownLines = filteredGames.map((game) => {
      const isNewlyPlayed = game.playtime_2weeks === game.playtime_forever;
      const iconURL = `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`;

      const playtimeHours = (game.playtime_forever / 60).toFixed(2); // Convert minutes to hours
      const playtimeMinutes = game.playtime_forever; // Total minutes

      return `- ![${game.name}](${iconURL}) **${game.name}** ${isNewlyPlayed ? "(Newly Played!)" : ""}  
        - **Playtime**: ${playtimeMinutes} minutes (${playtimeHours} hours)`;
    });

    // Write Markdown to file
    const markdownContent = `${markdownLines.join("\n")}`;
    return { steamMd: markdownContent };

  } catch (error) {
    console.error("Error fetching games:", error.message);
  }
};

export default fetchGames;
