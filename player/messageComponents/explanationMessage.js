export function explanationMessage(apiData, userOptions) {
  try {
    let playerDataString = '';
    let playerPossesive = apiData.possesive;
  
    playerDataString += `<strong>Username:</strong> ${apiData.username}<br>`;
    playerDataString += `<strong>UUID:</strong> ${apiData.uuid}<br>`

    if (apiData.utcOffset !== 'Unavailable') playerDataString += `<strong>UTC Offset Used:</strong> ${apiData.utcOffset}<br>`;

    if (apiData.legacyAPI === true) playerDataString += `<strong>Legacy API:</strong> Missing data<br>`;

    playerDataString += `<strong>Status:</strong> ${apiData.status}`;
  
    playerDataString += '<br><br>';

    if (apiData.isOnline === false) {
      playerDataString += `Your last session started at ${cleanTimeStamp(apiData.lastLoginTime, apiData.lastLoginDate)} (<strong>${cleanTime(timeAgo(apiData.lastLoginMS))}</strong> ago) and ended <strong>${apiData.offline.playtime}</strong> later after logging out. Your first-ever login was at ${cleanTimeStamp(apiData.firstLoginTime, apiData.firstLoginDate)}.`

      playerDataString += '<br><br>'
    
      playerDataString += `During this session, ${apiData.offline.lastGame !== 'Unavailable' ? `you played or joined the lobby <strong>${apiData.offline.lastGame}</strong>.` : `${apiData.username} played an <strong>unknown</strong> game.`}`;
    } else {
      playerDataString += `Your current session began at ${cleanTimeStamp(apiData.lastLoginTime, apiData.lastLoginDate)} (<strong>${cleanTime(timeAgo(apiData.lastLoginMS))}</strong> ago). Your first-ever login was on ${cleanTimeStamp(apiData.firstLoginTime, apiData.firstLoginDate)}.`;

      playerDataString += ` Your account's current playtime is <strong>${apiData.online.playtime}</strong>.`;

      playerDataString += '<br><br>';

      playerDataString += `Your account is currently playing ${apiData.online.gameType !== 'Unavailable' ? `<strong>${apiData.online.gameType}</strong>` : 'an <strong>unknown</strong> gametype'} in ${apiData.online.mode !== 'Unavailable' ? `the mode <strong>${apiData.online.mode}</strong>` : 'an <strong>unknown</strong> mode'} on ${apiData.online.map !== 'Unavailable' ? `the map <strong>${apiData.online.map}</strong>` : 'an <strong>unknown</strong> map'}.`;
    }

    playerDataString += '<br><br>';

    playerDataString += `Your account last used ${apiData.version !== 'Unavailable' ? `Minecraft version <strong>${apiData.version}</strong>` : 'an <strong>unknown</strong> version of Minecraft (which is not necessarily a sign of a disallowed client)'} and is using ${apiData.language !== 'Unavailable' ? `the language <strong>${apiData.language}</strong>` : 'an <strong>unknown</strong> language'} on Hypixel.`
  
    if (userOptions?.gameStats === true && (apiData.online.gameType ?? apiData.offline.lastGame)) switch (apiData.online.gameType ?? apiData.offline.lastGame) {
      case 'Bed Wars':
      case 'Bedwars':  
      case 'BEDWARS':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for Bed Wars:</strong><br>Level: ${apiData.bedwars.level}<br>Coins: ${apiData.bedwars.coins}<br>Total Games Joined: ${apiData.bedwars.gamesPlayed}<br>Winstreak: ${apiData.bedwars.winStreak}<br>Final K/D: ${apiData.bedwars.finalKD}<br>K/D: ${apiData.bedwars.KD}`;
        break;
      case 'Duels':
      case 'DUELS':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for Duels:</strong><br>Coins: ${apiData.duels.coins}<br>Cosmetic Count: ${apiData.duels.cosmetics}<br>K/D Ratio: ${apiData.duels.KD}<br>W/L Ratio: ${apiData.duels.WL}<br>Wins: ${apiData.duels.wins}<br>Kills: ${apiData.duels.kills}<br>Deaths: ${apiData.duels.deaths}`;
        break;
      case 'Blitz Survival Games':
      case 'Blitz':
      case 'HungerGames':
      case 'SURVIVAL_GAMES':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for Blitz Survival:</strong><br>Coins: ${apiData.blitz.coins}<br>K/D Ratio: ${apiData.blitz.KD}<br>W/L Ratio: ${apiData.blitz.WL}<br>Wins: ${apiData.blitz.wins}<br>Kills: ${apiData.blitz.kills}<br>Deaths: ${apiData.blitz.deaths}`;
        break;
      case 'Pit':
      case 'PIT':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for the Pit:</strong><br>Total Gold Earned: ${apiData.pit.gold}<br>Prestige: ${apiData.pit.prestige}<br>Total Playtime: ${apiData.pit.playtime} minutes<br>Best Streak: ${apiData.pit.bestStreak}<br>Chat Messages: ${apiData.pit.chatMessages}<br>K/D Ratio: ${apiData.pit.KD}<br>Kills: ${apiData.pit.kills}<br>Deaths: ${apiData.pit.deaths}`;
        break;
      case 'SkyWars':
      case 'SKYWARS':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for SkyWars:</strong><br>Level: ${apiData.skywars.level}<br>Coins: ${apiData.skywars.coins}<br>K/D Ratio: ${apiData.skywars.KD}<br>W/L Ratio: ${apiData.skywars.WL}<br>Wins: ${apiData.skywars.wins}<br>Kills: ${apiData.skywars.kills}<br>Deaths: ${apiData.skywars.deaths}`;
        break;
      case 'Speed UHC':
      case 'SpeedUHC':
      case 'SPEED_UHC':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for Speed UHC:</strong><br>Coins: ${apiData.speedUHC.coins}<br>K/D Ratio: ${apiData.speedUHC.KD}<br>W/L Ratio: ${apiData.speedUHC.WL}<br>Wins: ${apiData.speedUHC.wins}<br>Kills: ${apiData.speedUHC.kills}<br>Deaths: ${apiData.speedUHC.deaths}`;
         break;
      case 'UHC Champions':
      case 'UHC':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for UHC Champions:</strong><br>Level: ${apiData.uhc.level}<br>Coins: ${apiData.uhc.coins}<br>K/D Ratio: ${apiData.uhc.KD}<br>W/L Ratio: ${apiData.uhc.WL}<br>Wins: ${apiData.uhc.wins}<br>Kills: ${apiData.uhc.kills}<br>Deaths: ${apiData.uhc.deaths}`;
        break;
      case 'Walls':
      case 'WALLS':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for the Walls:</strong><br>Coins: ${apiData.walls.coins}<br>K/D Ratio: ${apiData.walls.KD}<br>W/L Ratio: ${apiData.walls.WL}<br>Wins: ${apiData.walls.wins}<br>Kills: ${apiData.walls.kills}<br>Deaths: ${apiData.walls.deaths}`;
        break;
      case 'Mega Walls':
      case 'MegaWalls':
      case 'Walls3':
      case 'WALLS3':
          playerDataString += `<br><br><strong>${playerPossesive} Stats for Mega Walls:</strong><br>Coins: ${apiData.megaWalls.coins}<br>K/D Ratio: ${apiData.megaWalls.KD}<br>W/L Ratio: ${apiData.megaWalls.WL}<br>Wins: ${apiData.megaWalls.wins}<br>Kills: ${apiData.megaWalls.kills}<br>Deaths: ${apiData.megaWalls.deaths}`;
        break;
    }

    if (userOptions?.authorNameOutput === true) {
      playerDataString = playerDataString.replace(/Your/gm, playerPossesive);
      playerDataString = playerDataString.replace(/your/gm, playerPossesive);
      playerDataString = playerDataString.replace(/You/gm, apiData.username);
      playerDataString = playerDataString.replace(/you/gm, apiData.username);
    }

    return playerDataString;

    function cleanTimeStamp(time, date) {
      if (time === 'Unavailable' || date === 'Unavailable') return '<strong>Unavailable</strong>';
      return `<strong>${time}</strong> on <strong>${date}</strong>`; //Not ideal for readability. Then again, neither is the rest of my code.
    }

    function timeAgo(ms) {
      if (ms < 0 || ms === null || isNaN(ms)) return 'Unavailable';
      return Date.now() - ms;
    }

    function cleanTime(ms) { //Takes MS
      if (ms < 0 || ms === null || isNaN(ms)) return 'Unavailable';
      let seconds = Math.round(ms / 1000);
      let days = Math.floor(seconds / (24 * 60 * 60));
      seconds -= days * 24 * 60 * 60
      let hours = Math.floor(seconds / (60 * 60));
      seconds -= hours * 60 * 60
      let minutes = Math.floor(seconds / 60);
      seconds -= minutes * 60;
      return `${days > 0 ? `${days}d ${hours}h ${minutes}m ${seconds}s` : hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s` }`;
    }

  } catch (err) {
    throw err;
  }
}