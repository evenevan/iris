export function detailMessage(apiData, userOptions) {
    let playerDataString = '';
  
    playerDataString += `<strong>Username:</strong> ${apiData?.username}<br>`;
    playerDataString += `<strong>UUID:</strong> ${apiData?.uuid}<br>`

    if (apiData?.legacyAPI === true) playerDataString += `<strong>Legacy API:</strong> Missing data<br>`;
    
    if (apiData?.utcOffset !== 'Unavailable') playerDataString += `<strong>UTC Offset Used:</strong> ${apiData?.utcOffset}<br>`;
  
    playerDataString += '<br>';
  
    playerDataString += `<strong>Version:</strong> ${apiData?.version}<br>`;
    playerDataString += `<strong>Language:</strong> ${apiData?.language}<br>`;
  
    playerDataString += '<br>';
  
    playerDataString += `<strong>Status:</strong> ${apiData?.status}<br>`;
  
    if (apiData?.isOnline === false) {
      playerDataString += `<strong>Last Playtime:</strong> ${apiData?.offline?.playtime}<br>`;
      playerDataString += `<strong>Last Gametype:</strong> ${apiData?.offline?.lastGame}<br>`;
    } else {
      playerDataString += `<strong>Playtime:</strong> ${cleanTime(timeAgo(apiData?.lastLoginMS))}<br>`;
      playerDataString += `<strong>Game Type:</strong> ${apiData?.online?.gameType}<br>`;
      playerDataString += `<strong>Game Mode:</strong> ${apiData?.online?.mode}<br>`;
      playerDataString += `<strong>Game Map:</strong> ${apiData?.online?.map}<br>`;
      if (!apiData?.online?.gameType && !apiData?.online?.mode && !apiData?.online?.map) playerDataString += `<strong>Game Data: Not available! Limited API?<br>`;
    }
    
    playerDataString += `<strong>First Login:</strong> ${apiData?.firstLoginTime}, ${apiData?.firstLoginDate}&nbsp;<br>&#8627;&nbsp;${cleanTime(timeAgo(apiData?.firstLoginMS))} ago<br>`;
    playerDataString += `<strong>Last Login:</strong> ${apiData?.lastLoginTime}, ${apiData?.lastLoginDate}&nbsp;<br>&#8627;&nbsp;${cleanTime(timeAgo(apiData?.lastLoginMS))} ago<br>`;
    playerDataString += `<strong>Last Logout:</strong> ${apiData?.lastLogoutTime}, ${apiData?.lastLogoutDate}&nbsp;<br>&#8627;&nbsp;${cleanTime(timeAgo(apiData?.lastLogoutMS))} ago<br>`;
  
    let playerPossesive = apiData?.possesive;
  
    if (userOptions?.gameStats === true && (apiData?.online?.gameType ?? apiData?.offline?.lastGame)) switch (apiData?.online?.gameType ?? apiData?.offline?.lastGame) {
      case 'Bed Wars':
      case 'Bedwars':  
      case 'BEDWARS':
            playerDataString += `<br><strong>${playerPossesive} Stats for Bed Wars:</strong><br>Level: ${apiData?.bedwars?.level}<br>Coins: ${apiData?.bedwars?.coins}<br>Total Games Joined: ${apiData?.bedwars?.gamesPlayed}<br>Winstreak: ${apiData?.bedwars?.winStreak}<br>Final K/D: ${apiData?.bedwars?.finalKD}<br>K/D: ${apiData?.bedwars?.KD}`;
        break;
      case 'Duels':
      case 'DUELS':
          playerDataString += `<br><strong>${playerPossesive} Stats for Duels:</strong><br>Coins: ${apiData?.duels?.coins}<br>Cosmetic Count: ${apiData?.duels?.cosmetics}<br>K/D Ratio: ${apiData?.duels?.KD}<br>W/L Ratio: ${apiData?.duels?.WL}<br>Wins: ${apiData?.duels?.wins}<br>Kills: ${apiData?.duels?.kills}<br>Deaths: ${apiData?.duels?.deaths}`;
        break;
      case 'Blitz Survival Games':
      case 'Blitz':
      case 'HungerGames':
      case 'SURVIVAL_GAMES':
          playerDataString += `<br><strong>${playerPossesive} Stats for Blitz Survival:</strong><br>Coins: ${apiData?.blitz?.coins}<br>K/D Ratio: ${apiData?.blitz?.KD}<br>W/L Ratio: ${apiData?.blitz?.WL}<br>Wins: ${apiData?.blitz?.wins}<br>Kills: ${apiData?.blitz?.kills}<br>Deaths: ${apiData?.blitz?.deaths}`;
        break;
      case 'Pit':
      case 'PIT':
          playerDataString += `<br><strong>${playerPossesive} Stats for the Pit:</strong><br>Total Gold Earned: ${apiData?.pit?.gold}<br>Prestige: ${apiData?.pit?.prestige}<br>Total Playtime: ${apiData?.pit?.playtime} minutes<br>Best Streak: ${apiData?.pit?.bestStreak}<br>Chat Messages: ${apiData?.pit?.chatMessages}<br>K/D Ratio: ${apiData?.pit?.KD}<br>Kills: ${apiData?.pit?.kills}<br>Deaths: ${apiData?.pit?.deaths}`;
        break;
      case 'SkyWars':
      case 'SKYWARS':
          playerDataString += `<br><strong>${playerPossesive} Stats for SkyWars:</strong><br>Level: ${apiData?.skywars?.level}<br>Coins: ${apiData?.skywars?.coins}<br>K/D Ratio: ${apiData?.skywars?.KD}<br>W/L Ratio: ${apiData?.skywars?.WL}<br>Wins: ${apiData?.skywars?.wins}<br>Kills: ${apiData?.skywars?.kills}<br>Deaths: ${apiData?.skywars?.deaths}`;
        break;
      case 'Speed UHC':
      case 'SpeedUHC':
      case 'SPEED_UHC':
          playerDataString += `<br><strong>${playerPossesive} Stats for Speed UHC:</strong><br>Coins: ${apiData?.speedUHC?.coins}<br>K/D Ratio: ${apiData?.speedUHC?.KD}<br>W/L Ratio: ${apiData?.speedUHC?.WL}<br>Wins: ${apiData?.speedUHC?.wins}<br>Kills: ${apiData?.speedUHC?.kills}<br>Deaths: ${apiData?.speedUHC?.deaths}`;
         break;
      case 'UHC Champions':
      case 'UHC':
          playerDataString += `<br><strong>${playerPossesive} Stats for UHC Champions:</strong><br>Level: ${apiData?.uhc?.level}<br>Coins: ${apiData?.uhc?.coins}<br>K/D Ratio: ${apiData?.uhc?.KD}<br>W/L Ratio: ${apiData?.uhc?.WL}<br>Wins: ${apiData?.uhc?.wins}<br>Kills: ${apiData?.uhc?.kills}<br>Deaths: ${apiData?.uhc?.deaths}`;
        break;
      case 'Walls':
      case 'WALLS':
          playerDataString += `<br><strong>${playerPossesive} Stats for the Walls:</strong><br>Coins: ${apiData?.walls?.coins}<br>K/D Ratio: ${apiData?.walls?.KD}<br>W/L Ratio: ${apiData?.walls?.WL}<br>Wins: ${apiData?.walls?.wins}<br>Kills: ${apiData?.walls?.kills}<br>Deaths: ${apiData?.walls?.deaths}`;
        break;
      case 'Mega Walls':
      case 'MegaWalls':
      case 'Walls3':
      case 'WALLS3':
          playerDataString += `<br><strong>${playerPossesive} Stats for Mega Walls:</strong><br>Coins: ${apiData?.megaWalls?.coins}<br>K/D Ratio: ${apiData?.megaWalls?.KD}<br>W/L Ratio: ${apiData?.megaWalls?.WL}<br>Wins: ${apiData?.megaWalls?.wins}<br>Kills: ${apiData?.megaWalls?.kills}<br>Deaths: ${apiData?.megaWalls?.deaths}`;
        break;
    }

    return playerDataString;

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
}