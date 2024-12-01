import asyncGetRequest from './std.js';

const API_URL = "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/";

// Fetch player games
const fetchGames = async (playerID, apiKey) => {
  try {
    // Fetch recently played games
    const url = `${API_URL}?key=${apiKey}&steamid=${playerID}&count=10`;
    const response = await asyncGetRequest(url);
    const games = JSON.parse(response).response?.games || [];
    const filteredGames = games;

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