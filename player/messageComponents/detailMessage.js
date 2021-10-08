export function detailMessage(apiData, userOptions) {
  let playerDataString = '';

  playerDataString += `<strong>Username:</strong> ${apiData?.username}`;
  playerDataString += `<br><strong>UUID:</strong> ${apiData?.uuid}`
  playerDataString += `<br><strong>Status:</strong> ${apiData?.status ?? 'Unavailable'}`;
  if (apiData?.legacyAPI === true) playerDataString += `<br><strong>Limited/Legacy API:</strong> Missing data`;
  if (apiData?.utcOffset) playerDataString += `<br><strong>UTC Offset Used:</strong> ${apiData?.utcOffset}`;


  playerDataString += `<br><br><strong>Version:</strong> ${apiData?.version ?? 'Unavailable'}`;
  playerDataString += `<br><strong>Language:</strong> ${apiData?.language ?? 'Unavailable'}`;

  if (userOptions?.firstLogin === true) playerDataString += `<br><strong>First Login:</strong> ${cleanTimeStamp(apiData?.firstLoginTime, apiData?.firstLoginDate, apiData?.firstLoginMS) ?? 'Unavailable'}`;
  playerDataString += `<br><strong>Last Login:</strong> ${cleanTimeStamp(apiData?.lastLoginTime, apiData?.lastLoginDate, apiData?.lastLoginMS) ?? 'Unavailable'}`;
  if (userOptions?.lastLogout === true) playerDataString += `<br><strong>Last Logout:</strong> ${cleanTimeStamp(apiData?.lastLogoutTime, apiData?.lastLogoutDate, apiData?.lastLogoutMS) ?? 'Unavailable'}`;

  if (apiData?.isOnline === true) {
    playerDataString += `<br><strong>Playtime:</strong> ${cleanTime(timeAgo(apiData?.lastLoginMS)) ?? 'Unavailable'}`;
    if (apiData?.recentGamesPlayed && apiData?.recentGamesPlayed !== 0) playerDataString += `<br><strong>Games Played:</strong> ${(Date.now() - apiData?.lastLoginMS) > 86400000 * 2.5 ? '~' : '' /* Only adds the tilde if the last login as more than 2.5  days ago */}${apiData?.recentGamesPlayed}`;
    playerDataString += `<br><strong>Game Type:</strong> ${apiData?.online?.gameType ?? 'Unavailable'}`;
    playerDataString += `<br><strong>Game Mode:</strong> ${apiData?.online?.mode ?? 'Unavailable'}`;
    playerDataString += `<br><strong>Game Map:</strong> ${apiData?.online?.map ?? 'Unavailable'}`;
  } else {
    playerDataString += `<br><strong>Last Playtime:</strong> ${apiData?.offline?.playtime ?? 'Unavailable'}`;
    if (apiData?.recentGamesPlayed && apiData?.recentGamesPlayed !== 0) playerDataString += `<br><strong>Games Played:</strong> ${(Date.now() - apiData?.lastLoginMS) > 86400000 * 2.5 ? '~' : '' /* Only adds the tilde if the last login as more than 2.5  days ago */}${apiData?.recentGamesPlayed}`;
    if (apiData?.recentGames?.[0] && apiData?.recentGames?.[0]?.startMS > apiData?.lastLoginMS && apiData?.recentGames?.[0]?.startMS < apiData?.lastLogoutMS) {
      playerDataString += `<br><br><strong>Last Played Game:</strong>`;
      playerDataString += `<br>&nbsp;<strong>Game Start:</strong> ${cleanTimeStamp(apiData?.recentGames?.[0]?.startTime, apiData?.recentGames?.[0]?.startDate) ?? 'Unavailable'}`;
      playerDataString += `<br>&nbsp;<strong>Game Length:</strong> ${cleanTime(apiData?.recentGames?.[0]?.gameLength) ?? 'Unavailable'}`;
      if (apiData?.recentGames?.[0]?.gameType) playerDataString += `<br>&nbsp;<strong>Game:</strong> ${apiData?.recentGames?.[0]?.gameType ?? 'Unavailable'}`;
      if (apiData?.recentGames?.[0]?.mode) playerDataString += `<br>&nbsp;<strong>Mode:</strong> ${apiData?.recentGames?.[0]?.mode ?? 'Unavailable'}`;
      if (apiData?.recentGames?.[0]?.map) playerDataString += `<br>&nbsp;<strong>Map:</strong> ${apiData?.recentGames?.[0]?.map ?? 'Unavailable'}`;
    } else if (apiData?.offline?.lastGame) {
      playerDataString += `<br><strong>Last Game Type:</strong> ${apiData?.offline?.lastGame}`;
    }
  }

  if (userOptions?.gameStats === true && ((apiData?.isOnline === true && apiData?.online?.gameType) || (apiData?.isOnline === false && apiData?.recentGames?.[0]?.gameType) || (apiData?.isOnline === false && apiData?.offline?.lastGame))) switch (apiData?.online?.gameType ?? apiData?.recentGames?.[0]?.gameType ?? apiData?.offline?.lastGame) {
    case 'Bed Wars':
    case 'Bedwars':  
    case 'BEDWARS':
      playerDataString += `<br><br><strong>${apiData?.possesive} Stats for Bed Wars:</strong><br>&nbsp;<b>Level:</b> ${apiData?.bedwars?.level}<br>&nbsp;<b>Coins:</b> ${apiData?.bedwars?.coins}<br>&nbsp;<b>Total Games Joined:</b> ${apiData?.bedwars?.gamesPlayed}<br>&nbsp;<b>Winstreak:</b> ${apiData?.bedwars?.winStreak}<br>&nbsp;<b>Final K/D:</b> ${apiData?.bedwars?.finalKD}<br>&nbsp;<b>K/D:</b> ${apiData?.bedwars?.KD}`;
    break;
    case 'Duels':
    case 'DUELS':
      playerDataString += `<br><br><strong>${apiData?.possesive} Stats for Duels:</strong><br>&nbsp;<b>Coins:</b> ${apiData?.duels?.coins}<br>&nbsp;<b>Cosmetic Count:</b> ${apiData?.duels?.cosmetics}<br>&nbsp;<b>K/D Ratio:</b> ${apiData?.duels?.KD}<br>&nbsp;<b>W/L Ratio:</b> ${apiData?.duels?.WL}<br>&nbsp;<b>Wins:</b> ${apiData?.duels?.wins}<br>&nbsp;<b>Kills:</b> ${apiData?.duels?.kills}<br>&nbsp;<b>Deaths:</b> ${apiData?.duels?.deaths}`;
    break;
    case 'Blitz Survival Games':
    case 'Blitz':
    case 'HungerGames':
    case 'SURVIVAL_GAMES':
      playerDataString += `<br><br><strong>${apiData?.possesive} Stats for Blitz Survival:</strong><br>&nbsp;<b>Coins:</b> ${apiData?.blitz?.coins}<br>&nbsp;<b>K/D Ratio:</b> ${apiData?.blitz?.KD}<br>&nbsp;<b>W/L Ratio:</b> ${apiData?.blitz?.WL}<br>&nbsp;<b>Wins:</b> ${apiData?.blitz?.wins}<br>&nbsp;<b>Kills:</b> ${apiData?.blitz?.kills}<br>&nbsp;<b>Deaths:</b> ${apiData?.blitz?.deaths}`;
    break;
    case 'Pit':
    case 'PIT':
      playerDataString += `<br><br><strong>${apiData?.possesive} Stats for the Pit:</strong><br>&nbsp;<b>Total Gold Earned:</b> ${apiData?.pit?.gold}<br>&nbsp;<b>Prestige:</b> ${apiData?.pit?.prestige}<br>&nbsp;<b>Total Playtime:</b> ${apiData?.pit?.playtime} minutes<br>&nbsp;<b>Best Streak:</b> ${apiData?.pit?.bestStreak}<br>&nbsp;<b>Chat Messages:</b> ${apiData?.pit?.chatMessages}<br>&nbsp;<b>K/D Ratio:</b> ${apiData?.pit?.KD}<br>&nbsp;<b>Kills:</b> ${apiData?.pit?.kills}<br>&nbsp;<b>Deaths:</b> ${apiData?.pit?.deaths}`;
    break;
    case 'SkyWars':
    case 'SKYWARS':
      playerDataString += `<br><br><strong>${apiData?.possesive} Stats for SkyWars:</strong><br>&nbsp;<b>Level:</b> ${apiData?.skywars?.level}<br>&nbsp;<b>Coins:</b> ${apiData?.skywars?.coins}<br>&nbsp;<b>K/D Ratio:</b> ${apiData?.skywars?.KD}<br>&nbsp;<b>W/L Ratio:</b> ${apiData?.skywars?.WL}<br>&nbsp;<b>Wins:</b> ${apiData?.skywars?.wins}<br>&nbsp;<b>Kills:</b> ${apiData?.skywars?.kills}<br>&nbsp;<b>Deaths:</b> ${apiData?.skywars?.deaths}`;
    break;
    case 'Speed UHC':
    case 'SpeedUHC':
    case 'SPEED_UHC':
      playerDataString += `<br><br><strong>${apiData?.possesive} Stats for Speed UHC:</strong><br>&nbsp;<b>Coins:</b> ${apiData?.speedUHC?.coins}<br>&nbsp;<b>K/D Ratio:</b> ${apiData?.speedUHC?.KD}<br>&nbsp;<b>W/L Ratio:</b> ${apiData?.speedUHC?.WL}<br>&nbsp;<b>Wins:</b> ${apiData?.speedUHC?.wins}<br>&nbsp;<b>Kills:</b> ${apiData?.speedUHC?.kills}<br>&nbsp;<b>Deaths:</b> ${apiData?.speedUHC?.deaths}`;
      break;
    case 'UHC Champions':
    case 'UHC':
      playerDataString += `<br><strong>${apiData?.possesive} Stats for UHC Champions:</strong><br>&nbsp;<b>Level:</b> ${apiData?.uhc?.level}<br>&nbsp;<b>Coins:</b> ${apiData?.uhc?.coins}<br>&nbsp;<b>K/D Ratio:</b> ${apiData?.uhc?.KD}<br>&nbsp;<b>W/L Ratio:</b> ${apiData?.uhc?.WL}<br>&nbsp;<b>Wins:</b> ${apiData?.uhc?.wins}<br>&nbsp;<b>Kills:</b> ${apiData?.uhc?.kills}<br>&nbsp;<b>Deaths:</b> ${apiData?.uhc?.deaths}<br>`;
    break;
    case 'Walls':
    case 'WALLS':
      playerDataString += `<br><br><strong>${apiData?.possesive} Stats for the Walls:</strong><br>&nbsp;<b>Coins:</b> ${apiData?.walls?.coins}<br>&nbsp;<b>K/D Ratio:</b> ${apiData?.walls?.KD}<br>&nbsp;<b>W/L Ratio:</b> ${apiData?.walls?.WL}<br>&nbsp;<b>Wins:</b> ${apiData?.walls?.wins}<br>&nbsp;<b>Kills:</b> ${apiData?.walls?.kills}<br>&nbsp;<b>Deaths:</b> ${apiData?.walls?.deaths}`;
    break;
    case 'Mega Walls':
    case 'MegaWalls':
    case 'Walls3':
    case 'WALLS3':
      playerDataString += `<br><br><strong>${apiData?.possesive} Stats for Mega Walls:</strong><br>&nbsp;<b>Coins:</b> ${apiData?.megaWalls?.coins}<br>&nbsp;<b>K/D Ratio:</b> ${apiData?.megaWalls?.KD}<br>&nbsp;<b>W/L Ratio:</b> ${apiData?.megaWalls?.WL}<br>&nbsp;<b>Wins:</b> ${apiData?.megaWalls?.wins}<br>&nbsp;<b>Kills:</b> ${apiData?.megaWalls?.kills}<br>&nbsp;<b>Deaths:</b> ${apiData?.megaWalls?.deaths}`;
        break;
  }

  return playerDataString;

  function cleanTimeStamp(time, date, ms) {
    if (!time || !date) return null;
    return `${time}, ${date}${ms ? `<br>&nbsp;&#8627; ${cleanTime(timeAgo(ms))} ago` : ''}`; //Not ideal for readability. Then again, neither is the rest of my code.
  }

  function timeAgo(ms) {
    if (ms < 0 || ms === null || isNaN(ms)) return null;
    return Date.now() - ms;
  }

  function cleanTime(ms) {
    if (ms < 0 || ms === null || isNaN(ms)) return null;
    let seconds = Math.round(ms / 1000);
    let days = Math.floor(seconds / (24 * 60 * 60));
    seconds -= days * 24 * 60 * 60;
    let hours = Math.floor(seconds / (60 * 60));
    seconds -= hours * 60 * 60;
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return `${days > 0 ? `${days}d ${hours}h ${minutes}m ${seconds}s` : hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s` }`;
  }
}