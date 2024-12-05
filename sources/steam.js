import asyncGetRequest from './std.js';

const API_URL = "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/";
const STORE_API_URL = "https://store.steampowered.com/api/appdetails";
const ACHIEVEMENTS_API_URL = "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/";

// Helper function to check if a game is adult-only
const isAdultOnly = async (appID) => {
  try {
    const url = `${STORE_API_URL}?appids=${appID}`;
    const response = await asyncGetRequest(url);
    const data = JSON.parse(response);

    if (data[appID]?.success) {
      const descriptors = data[appID].data?.content_descriptors?.ids || [];
      return descriptors.includes(3); // Assuming ID 3 corresponds to adult-only
    }
    return false;
  } catch (error) {
    console.error(`Error checking adult-only status for appID ${appID}:`, error.message);
    return false; // Assume not adult-only on error
  }
};

// Helper function to format achievement data
const formatAchievement = (achievement) => {
  const icon = achievement.icon || achievement.icongray; // Use icon if available
  if (!icon) {
    return null; // Skip achievements with no valid icon
  }

  const name = achievement.displayName || formatApiName(achievement.apiname); // Use displayName or format apiname
  return `![${name}](${icon}) ${name}`;
};

// Helper function to format API names into readable strings
const formatApiName = (apiname) => {
  return apiname
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

// Fetch player achievements for a specific game
const fetchAchievements = async (playerID, apiKey, appID) => {
  try {
    const url = `${ACHIEVEMENTS_API_URL}?key=${apiKey}&steamid=${playerID}&appid=${appID}`;
    const response = await asyncGetRequest(url);
    const data = JSON.parse(response);

    if (data?.playerstats?.achievements) {
      const unlockedAchievements = data.playerstats.achievements
        .filter((ach) => ach.achieved) // Only include unlocked achievements
        .map(formatAchievement)
        .filter(Boolean); // Remove null values from invalid icons

      return unlockedAchievements.length
        ? unlockedAchievements.join(" ")
        : "No achievements unlocked";
    }
    return "No achievements unlocked";
  } catch (error) {
    console.error(`Error fetching achievements for appID ${appID}:`, error.message);
    return "Error fetching achievements";
  }
};

// Fetch player games and achievements
const fetchGames = async (playerID, apiKey) => {
  try {
    const url = `${API_URL}?key=${apiKey}&steamid=${playerID}&count=10`;
    const response = await asyncGetRequest(url);
    const games = JSON.parse(response).response?.games || [];

    // Filter out adult-only games
    const filteredGames = await Promise.all(
      games.map(async (game) => {
        const adultOnly = await isAdultOnly(game.appid);
        return adultOnly ? null : game;
      })
    ).then((results) => results.filter(Boolean)); // Remove null values

    // Prepare Markdown content
    const markdownLines = await Promise.all(
      filteredGames.slice(0, 5).map(async (game) => {
        const isNewlyPlayed = game.playtime_2weeks === game.playtime_forever;
        const iconURL = `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`;

        const playtimeHours = (game.playtime_forever / 60).toFixed(2); // Convert minutes to hours
        const playtimeMinutes = game.playtime_forever; // Total minutes

        // Fetch achievements for the game
        // const achievements = await fetchAchievements(playerID, apiKey, game.appid);

        return `![${game.name}](${iconURL}) **[${game.name}](https://store.steampowered.com/app/${game.appid})** ${isNewlyPlayed ? "(Newly Played!)" : ""}  
          - **Playtime**: ${playtimeMinutes} minutes (${playtimeHours} hours)`;
          // - **Achievements**: ${achievements}`;
      })
    );

    return { steamMd: markdownLines.join("\n\n").replace(/&#x2F;/g, "/") };
  } catch (error) {
    console.error("Error fetching games:", error.message);
    return { steamMd: "Error fetching games" };
  }
};

export default fetchGames;
