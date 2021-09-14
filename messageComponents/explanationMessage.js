export function explanationMessage(userData, userOptions) {
  try {
    let playerDataString = '';
    let playerPossesive = userData.possesive;
  
    playerDataString += `<strong>Username:</strong> ${userData.username}<br>`;
    playerDataString += `<strong>UUID:</strong> ${userData.uuid}<br>`
    playerDataString += `${userData.utcOffset}<br>`;
    playerDataString += `<strong>Status:</strong> ${userData.status}`;
  
    playerDataString += '<br><br>';

    if (userData.isOnline === false) {
      playerDataString += `Your account logged in last on <strong>${userData.lastLoginStamp}</strong> (<strong>${userData.lastLoginSince}</strong>) and then logged out after <strong>${userData.offline.playtime}</strong>.`

      playerDataString += '<br><br>'
    
      playerDataString += `During this session, ${userData.offline.lastGame !== 'Unavailable' ? `you played or joined the lobby <strong>${userData.offline.lastGame}</strong>.` : `${userData.username} played an <strong>unknown</strong> game.`}`;
    } else {
      playerDataString += `You started your current session on <strong>${userData.lastLoginStamp}</strong> (<strong>${userData.lastLoginSince}</strong> ago).`;

      playerDataString += ` Your account's current playtime is <strong>${userData.online.playtime}</strong>.`;

      playerDataString += '<br><br>';

      playerDataString += `Your account is currently playing ${userData.online.gameType !== 'Unavailable' ? `<strong>${userData.online.gameType}</strong>` : 'an <strong>unknown</strong> gametype'} in ${userData.online.mode !== 'Unavailable' ? `the mode <strong>${userData.online.mode}</strong>` : 'an <strong>unknown</strong> mode'} on ${userData.online.map !== 'Unavailable' ? `the map <strong>${userData.online.map}</strong>` : 'an <strong>unknown</strong> map'}.`;
    }

    playerDataString += '<br><br>';

    playerDataString += `Your account is using ${userData.version !== 'Unavailable' ? `Minecraft version <strong>${userData.version}</strong>` : 'an <strong>unknown</strong> version of Minecraft (which is not necessarily a sign of a disallowed client)'} and is using ${userData.language !== 'Unavailable' ? `the language <strong>${userData.language}</strong>` : 'an <strong>unknown</strong> language'} on Hypixel.`
  
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

    if (userOptions.authorNameOutput === true) {
      playerDataString = playerDataString.replace(/Your/gm, `${playerPossesive}`);
      playerDataString = playerDataString.replace(/your/gm, 'their');
      playerDataString = playerDataString.replace(/you/gm, `${userData.username}`);
    }

    console.log(playerDataString)

    return playerDataString;
  } catch (err) {
    console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack);
    throw err;
  }
}