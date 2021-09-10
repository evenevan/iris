export function detailMessage(userData, userOptions) {
  try {
    let playerDataString = '';
  
    playerDataString += `<strong>Username:</strong> ${userData.username}<br>`;
    playerDataString += `<strong>UUID:</strong> ${userData.uuid}<br>`
  
    playerDataString += '<br>';
  
    playerDataString += `<strong>Language:</strong> ${userData.language}<br>`;
    playerDataString += `<strong>Version:</strong> ${userData.version}<br>`;
  
    playerDataString += '<br>';
  
    playerDataString += `<strong>Status:</strong> ${userData.status}<br>`;
  
    if (userData.isOnline === false) {
      playerDataString += `<strong>Last Playtime:</strong> ${userData.offline.playtime}<br>`;
      playerDataString += `<strong>Last Gametype:</strong> ${userData.offline.lastGame}<br>`;
    } else {
      playerDataString += `<strong>Playtime:</strong> ${userData.online.playtime}<br>`;
      playerDataString += `<strong>Game Type:</strong> ${userData.online.gameType}<br>`;
      playerDataString += `<strong>Game Mode:</strong> ${userData.online.mode}<br>`;
      playerDataString += `<strong>Game Map:</strong> ${userData.online.map}<br>`;
      if (!userData.online.gameType && !userData.online.mode && !userData.online.map) playerDataString += `<strong>Game Data: Not available! Limited API?<br>`;
    }
    
    playerDataString += `<strong>Last Login:</strong> ${userData.lastLoginStamp}<br> -> ${userData.lastLoginSince} ago<br>`;
    playerDataString += `<strong>Last Logout:</strong> ${userData.lastLogoutStamp}<br> -> ${userData.lastLogoutSince} ago<br>`;
    playerDataString += userData.utcOffset;
  
    let playerPossesive = userData.possesive;
  
    if (userOptions.gameStats === true && (userData.online.gameType ?? userData.offline.lastGame)) switch (userData.online.gameType ?? userData.offline.lastGame) {
      case 'Bed Wars':
      case 'Bedwars':  
      case 'BEDWARS':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for Bed Wars:</strong><br>Level: ${userData.bedwars.level}<br>Coins: ${userData.bedwars.coins}<br>Total Games Joined: ${userData.bedwars.gamesPlayed}<br>Winstreak: ${userData.bedwars.winStreak}<br>Final K/D: ${userData.bedwars.finalKD}<br>K/D: ${userData.bedwars.KD}`;
        break;
      case 'Duels':
      case 'DUELS':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for Duels:</strong><br>Coins: ${userData.duels.coins}<br>Cosmetic Count: ${userData.duels.cosmetics}<br>K/D Ratio: ${userData.duels.KD}<br>W/L Ratio: ${userData.duels.WL}<br>Wins: ${userData.duels.wins}<br>Kills: ${userData.duels.kills}<br>Deaths: ${userData.duels.deaths}`;
        break;
      case 'Blitz Survival Games':
      case 'Blitz':
      case 'HungerGames':
      case 'SURVIVAL_GAMES':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for Blitz Survival:</strong><br>Coins: ${userData.blitz.coins}<br>K/D Ratio: ${userData.blitz.KD}<br>W/L Ratio: ${userData.blitz.WL}<br>Wins: ${userData.blitz.wins}<br>Kills: ${userData.blitz.kills}<br>Deaths: ${userData.blitz.deaths}`;
        break;
      case 'Pit':
      case 'PIT':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for the Pit:</strong><br>Total Gold Earned: ${userData.pit.gold}<br>Prestige: ${userData.pit.prestige}<br>Total Playtime: ${userData.pit.playtime} minutes<br>Best Streak: ${userData.pit.bestStreak}<br>Chat Messages: ${userData.pit.chatMessages}<br>K/D Ratio: ${userData.pit.KD}<br>Kills: ${userData.pit.kills}<br>Deaths: ${userData.pit.deaths}`;
        break;
      case 'SkyWars':
      case 'SKYWARS':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for SkyWars:</strong><br>Level: ${userData.skywars.level}<br>Coins: ${userData.skywars.coins}<br>K/D Ratio: ${userData.skywars.KD}<br>W/L Ratio: ${userData.skywars.WL}<br>Wins: ${userData.skywars.wins}<br>Kills: ${userData.skywars.kills}<br>Deaths: ${userData.skywars.deaths}`;
        break;
      case 'Speed UHC':
      case 'SpeedUHC':
      case 'SPEED_UHC':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for Speed UHC:</strong><br>Coins: ${userData.speedUHC.coins}<br>K/D Ratio: ${userData.speedUHC.KD}<br>W/L Ratio: ${userData.speedUHC.WL}<br>Wins: ${userData.speedUHC.wins}<br>Kills: ${userData.speedUHC.kills}<br>Deaths: ${userData.speedUHC.deaths}`;
         break;
      case 'UHC Champions':
      case 'UHC':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for UHC Champions:</strong><br>Level: ${userData.uhc.level}<br>Coins: ${userData.uhc.coins}<br>K/D Ratio: ${userData.uhc.KD}<br>W/L Ratio: ${userData.uhc.WL}<br>Wins: ${userData.uhc.wins}<br>Kills: ${userData.uhc.kills}<br>Deaths: ${userData.uhc.deaths}`;
        break;
      case 'Walls':
      case 'WALLS':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for the Walls:</strong><br>Coins: ${userData.walls.coins}<br>K/D Ratio: ${userData.walls.KD}<br>W/L Ratio: ${userData.walls.WL}<br>Wins: ${userData.walls.wins}<br>Kills: ${userData.walls.kills}<br>Deaths: ${userData.walls.deaths}`;
        break;
      case 'Mega Walls':
      case 'MegaWalls':
      case 'Walls3':
      case 'WALLS3':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for Mega Walls:</strong><br>Coins: ${userData.megaWalls.coins}<br>K/D Ratio: ${userData.megaWalls.KD}<br>W/L Ratio: ${userData.megaWalls.WL}<br>Wins: ${userData.megaWalls.wins}<br>Kills: ${userData.megaWalls.kills}<br>Deaths: ${userData.megaWalls.deaths}`;
        break;
    }

    return playerDataString;
  } catch (err) {
    console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack);
    throw err;
  }
}