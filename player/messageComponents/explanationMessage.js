export function explanationMessage(apiData, userOptions) {
  let playerDataString = '';

  console.log(apiData)

  playerDataString += `<strong>Username:</strong> ${apiData?.username}`;
  playerDataString += `<br><strong>UUID:</strong> ${apiData?.uuid}`
  playerDataString += `<br><strong>Status:</strong> ${apiData?.status ?? 'Unavailable'}`;
  if (apiData?.legacyAPI === true) playerDataString += `<br><strong>Limited/Legacy API:</strong> Missing data`;
  if (apiData?.utcOffset) playerDataString += `<br><strong>UTC Offset Used:</strong> ${apiData?.utcOffset}`;

  if (apiData?.isOnline === true) {
    playerDataString += `<br><br>Your current session began at ${cleanTimeStamp(apiData?.lastLoginTime, apiData?.lastLoginDate)} (<strong>${cleanTime(timeAgo(apiData?.lastLoginMS))}</strong> ago). Your first-ever login was on ${cleanTimeStamp(apiData?.firstLoginTime, apiData?.firstLoginDate)}. Your account's current playtime is <strong>${apiData?.online?.playtime}</strong>.`;

    playerDataString += `<br><br>Your account is currently playing ${apiData?.online?.gameType ? `<strong>${apiData?.online?.gameType}</strong>` : 'an <strong>unknown</strong> gametype'} in ${apiData?.online?.mode ? `the mode <strong>${apiData?.online?.mode}</strong>` : 'an <strong>unknown</strong> mode'} on ${apiData?.online?.map ? `the map <strong>${apiData?.online?.map}</strong>` : 'an <strong>unknown</strong> map'}.`;

    playerDataString += `<br><br>Your account is using ${apiData?.version ? `Minecraft version <strong>${apiData?.version}</strong>` : 'an <strong>unidentifiable</strong> version of Minecraft'} and is using ${apiData?.language ? `the language <strong>${apiData?.language}</strong>` : 'an <strong>unknown</strong> language'} on Hypixel.`
  } else {
    playerDataString += `<br><br>Your last session started at ${cleanTimeStamp(apiData?.lastLoginTime, apiData?.lastLoginDate)} (<strong>${cleanTime(timeAgo(apiData?.lastLoginMS)) ?? 'Unavailable'}</strong> ago) and ended <strong>${apiData?.offline?.playtime ?? 'Unavailable'}</strong> later after logging out. Your first-ever login was at ${cleanTimeStamp(apiData?.firstLoginTime, apiData?.firstLoginDate)}.`

    if (apiData?.recentGames[0]) {
      playerDataString += `<br><br>Your last recorded game played was <strong>${apiData?.recentGames[0]?.gameType}</strong> of mode <strong>${apiData?.recentGames[0]?.mode}</strong> at <strong>${apiData?.recentGames[0]?.startTime}</strong> on <strong>${apiData?.recentGames[0]?.startDate}</strong>.`;
      if (apiData?.recentGames[0]?.map) playerDataString += ` You played this game on the map <strong>${apiData?.recentGames[0]?.map}</strong>.`
      if (apiData?.recentGames[0]?.gameLength) playerDataString += ` This game lasted for <strong>${apiData?.recentGames[0]?.gameLength ?? 'an unknown amount of time'}</strong> (not to be confused as your playtime of this game).`
    } else if (apiData?.offline?.lastGame) {
      playerDataString += `<br><br>You played or joined the lobby <strong>${apiData?.offline?.lastGame}</strong> during your last session.`;
    }

    playerDataString += `<br><br>Your account last used ${apiData?.version ? `Minecraft version <strong>${apiData?.version}</strong>` : 'an <strong>unidentifiable</strong> version of Minecraft'} and is using ${apiData?.language ? `the language <strong>${apiData?.language}</strong>` : 'an <strong>unknown</strong> language'} on Hypixel.`
  }

  if (userOptions?.gameStats === true && ((apiData?.isOnline === true && apiData?.online?.gameType) || (apiData?.isOnline === false && apiData?.recentGames[0]?.gameType) || (apiData?.isOnline === false && apiData?.offline?.lastGame))) switch (apiData?.online?.gameType ?? apiData?.recentGames[0]?.gameType ?? apiData?.offline?.lastGame) {
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

  if (userOptions?.authorNameOutput === true) {
    playerDataString = playerDataString.replace(/Your/gm, apiData?.possesive);
    playerDataString = playerDataString.replace(/your/gm, apiData?.possesive);
    playerDataString = playerDataString.replace(/You/gm, apiData?.username);
    playerDataString = playerDataString.replace(/you/gm, apiData?.username);
  }

  return playerDataString;

  function cleanTimeStamp(time, date) {
    if (!time || time === 'Unavailable' || !date || date === 'Unavailable') return '<strong>Unavailable</strong>';
    return `<strong>${time}</strong> on <strong>${date}</strong>`; //Not ideal for readability. Then again, neither is the rest of my code.
  }

  function timeAgo(ms) {
    if (ms < 0 || ms === null || isNaN(ms)) return null;
    return Date.now() - ms;
  }

  function cleanTime(ms) { //Takes MS
    if (ms < 0 || ms === null || isNaN(ms)) return null;
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