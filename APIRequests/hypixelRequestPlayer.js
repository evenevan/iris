const fetchTimeout = (url, ms, { signal, ...options } = {}) => { //Yoinked from https://stackoverflow.com/a/57888548 under CC BY-SA 4.0
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    if (signal) signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
};

export function hypixelRequestPlayer(uuid, apiKey, undefinedIfHasntAborted) {
    let controller = new AbortController();
    return Promise.all([
        fetchTimeout(`https://api.hypixel.net/player?uuid=${uuid}&key=${apiKey}`, 2000, {
            signal: controller.signal
          }).then(async function(response) {
            if (!response.ok) {
              let responseJson = await response.json();
              let newError = new Error(`HTTP status ${response.status}; ${responseJson}`);
              newError.name = "HTTPError";
              throw newError;
            }
            return response.json();
          }),
        fetchTimeout(`https://api.hypixel.net/status?uuid=${uuid}&key=${apiKey}`, 2000, {
            signal: controller.signal
          }).then(async function(response) {
            if (!response.ok) {
              let responseJson = await response.json();
              let newError = new Error(`HTTP status ${response.status}; ${responseJson.cause}`);
              newError.name = "HTTPError";
              throw newError;
            }
            return response.json();
          })
      ])
      .then((player) => {
        if (player[0].player === null) {let newError = new Error(""); newError.name = "NotFound"; throw newError;}
        return hypixelProcessData(player[0].player, player[1]);
      })
      .catch(async (err) => {
        if (err.name === "AbortError") {
            if (undefinedIfHasntAborted === undefined) return requestUUID(player, dataReturn, userOptions, true); //Simple way to try again without an infinite loop
        }
        console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack);
        throw err;
      });
};

async function hypixelProcessData(playerData, statusData) {
  try {
    let tzOffset =  new Date().getTimezoneOffset() / 60;
    let tzOffsetString = `UTC${createOffset(new Date())}`;
    
    let timeSinceLastLogin = `${secondsToDays(new Date() - (playerData?.lastLogin ?? 0))}${new Date(new Date() - (playerData?.lastLogin ?? 0)).toISOString().substr(11, 8)}`,
          timeSinceLastLogout = `${secondsToDays(new Date() - (playerData?.lastLogout ?? 0))}${new Date(new Date() - (playerData?.lastLogout ?? 0)).toISOString().substr(11, 8)}`;
    
    let lastLoginTimestamp = cleanDate(new Date((playerData?.lastLogin ?? 0) + tzOffset)) + ", " + new Date((playerData?.lastLogin ?? 0) + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let lastLogoutTimestamp = cleanDate(new Date((playerData?.lastLogout ?? 0) + tzOffset)) + ", " + new Date((playerData?.lastLogout ?? 0) + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    
    let lastPlaytime = `${secondsToDays((playerData?.lastLogout ?? 0) - (playerData?.lastLogin ?? 0))}${new Date((playerData?.lastLogout ?? 0) - (playerData?.lastLogin ?? 0)).toISOString().substr(11, 8)}`;
    
    function secondsToDays(ms) { //calculating days from seconds
        ms = ms / 1000;
        let day = Math.floor(ms / (3600 * 24));
        let days = day > 0 ? day + (day == 1 ? ' day ' : ' days ') : '';
        return days;
    }
      
    function cleanDate(epoch) {
        let date = epoch.getDate();
        let month = new Intl.DateTimeFormat('en-US', {month: 'short'}).format(epoch);
        let year = epoch.getFullYear();
        return month + " " + date + ", " + year;
    }
    
    function pad(value) { //Yoinked from https://stackoverflow.com/a/13016136 under CC BY-SA 3.0 matching ISO 8601
        return value < 10 ? '0' + value : value;
    }
    function createOffset(date) { //Yoinked from https://stackoverflow.com/a/13016136 under CC BY-SA 3.0 matching ISO 8601
        let sign = (date.getTimezoneOffset() > 0) ? "-" : "+";
        let offset = Math.abs(date.getTimezoneOffset());
        let hours = pad(Math.floor(offset / 60));
        let minutes = pad(offset % 60);
        return sign + hours + ":" + minutes;
    }
  
    let userData = new Object();
    userData.username = playerData?.displayname ?? '';
    userData.possesive = playerData?.username?.endsWith('s') ? `${playerData?.displayname}'` : `${playerData?.displayname}'s`;
    userData.uuid = playerData?.uuid ?? '';
    userData.language = playerData?.userLanguage ?? 'Unavailable';
    userData.version = playerData?.mcVersionRp ?? 'Unavailable';
    userData.status = statusData?.session?.online && (playerData?.lastLogin ?? 0) >= (playerData?.lastLogout ?? 0) ? 'Online' : !statusData?.session?.online && (playerData?.lastLogin ?? 0) <= (playerData?.lastLogout ?? 0) ? 'Offline' : 'Unavailable';
    userData.isOnline = statusData?.session?.online === true ? true : false;
  
    if (statusData?.session?.online === true) {
      userData.offline = {}
      userData.offline.playtime = null;
      userData.offline.lastGame = null;
      userData.online = {}
      userData.online.playtime = playerData?.lastLogin ? timeSinceLastLogin : 'Unavailable';
      userData.online.gameType = statusData?.session?.gameType ?? 'Unavailable';
      userData.online.mode = statusData?.session?.mode ?? 'Unavailable';
      userData.online.map = statusData?.session?.map ?? 'Unavailable';
    } else {
      userData.offline = {}
      userData.offline.playtime = playerData?.lastLogin && playerData?.lastLogin < playerData?.lastLogout ? lastPlaytime : 'Unavailable';
      userData.offline.lastGame = playerData?.mostRecentGameType ?? 'Unavailable';
      userData.online = {}
      userData.online.playtime = null;
      userData.online.gameType = null;
      userData.online.mode = null;
      userData.online.map = null;
    }
  
    userData.lastLoginStamp = playerData?.lastLogin ? `${lastLoginTimestamp}` : 'Unavailable';
    userData.lastLoginSince = playerData?.lastLogin ? `${timeSinceLastLogin} ago` : 'Unavailable';
    userData.lastLogoutStamp = playerData?.lastLogout ? `${lastLogoutTimestamp}` : 'Unavailable';
    userData.lastLogoutSince = playerData?.lastLogout ? `${timeSinceLastLogout} ago` : 'Unavailable';
    userData.utcOffset = playerData?.lastLogin || playerData?.lastLogout ? `<strong>UTC Offset Used:</strong> ${tzOffsetString}` : '';
  
    userData.bedwars = {}
    userData.bedwars.level = playerData?.achievements?.bedwars_level ?? 0;
    userData.bedwars.coins = playerData?.stats?.Bedwars?.coins ?? 0;
    userData.bedwars.wins = playerData?.stats?.Bedwars?.wins_bedwars ?? 0;
    userData.bedwars.gamesPlayed = playerData?.stats?.Bedwars?.games_played_bedwars ?? 0;
    userData.bedwars.winStreak = playerData?.stats?.Bedwars?.winstreak ?? 0;
    userData.bedwars.finalKD = ratio(playerData?.stats?.Bedwars?.final_kills_bedwars, playerData?.stats?.Bedwars?.final_deaths_bedwars);
    userData.bedwars.KD = ratio(playerData?.stats?.Bedwars?.kills_bedwars, playerData?.stats?.Bedwars?.deaths_bedwars);
  
    userData.duels = {}
    userData.duels.coins = playerData?.stats?.Duels?.coins ?? 0;
    userData.duels.cosmetics = playerData?.stats?.Duels?.packages?.length ?? 0;
    userData.duels.KD = ratio(playerData?.stats?.Duels?.kills ?? 0, playerData?.stats?.Duels?.deaths ?? 0);
    userData.duels.WL = ratio(playerData?.stats?.Duels?.wins ?? 0, playerData?.stats?.Duels?.deaths ?? 0);
    userData.duels.wins = playerData?.stats?.Duels?.wins ?? 0;
    userData.duels.kills = playerData?.stats?.Duels?.kills ?? 0;
    userData.duels.deaths = playerData?.stats?.Duels?.deaths ?? 0
  
    userData.blitz = {}
    userData.blitz.coins = playerData?.stats?.HungerGames?.coins ?? 0;
    userData.blitz.KD = ratio(playerData?.stats?.HungerGames?.kills, playerData?.stats?.HungerGames?.deaths);
    userData.blitz.WL = ratio(playerData?.stats?.HungerGames?.wins, playerData?.stats?.HungerGames?.deaths);
    userData.blitz.wins = playerData?.stats?.HungerGames?.wins ?? 0;
    userData.blitz.kills = playerData?.stats?.HungerGames?.kills ?? 0;
    userData.blitz.deaths = playerData?.stats?.HungerGames?.deaths ?? 0;
  
    userData.pit = {}
    userData.pit.gold = playerData?.stats?.Pit?.pit_stats_ptl?.cash_earned ?? 0;
    userData.pit.prestige = playerData?.achievements?.pit_prestiges ?? 0;
    userData.pit.playtime = playerData?.stats?.Pit?.pit_stats_ptl?.playtime_minutes;
    userData.pit.bestStreak = playerData?.stats?.Pit?.pit_stats_ptl?.max_streak;
    userData.pit.chatMessages = playerData?.stats?.Pit?.pit_stats_ptl?.chat_messages ?? 0;
    userData.pit.KD = ratio(playerData?.stats?.Pit?.pit_stats_ptl?.kills, playerData?.stats?.Pit?.pit_stats_ptl?.deaths);
    userData.pit.kills = playerData?.stats?.Pit?.pit_stats_ptl?.kills ?? 0;
    userData.pit.deaths = playerData?.stats?.Pit?.pit_stats_ptl?.deaths ?? 0;
  
    userData.skywars = {}
    userData.skywars.level = playerData?.achievements?.skywars_you_re_a_star ?? 0;
    userData.skywars.coins = playerData?.stats?.SkyWars?.coins ?? 0;
    userData.skywars.KD = ratio(playerData?.stats?.SkyWars?.kills, playerData?.stats?.SkyWars?.deaths);
    userData.skywars.WL = ratio(playerData?.stats?.SkyWars?.wins, playerData?.stats?.SkyWars?.losses);
    userData.skywars.wins = playerData?.stats?.SkyWars?.wins ?? 0;
    userData.skywars.kills = playerData?.stats?.SkyWars?.kills ?? 0;
    userData.skywars.deaths = playerData?.stats?.SkyWars?.deaths ?? 0;
  
    userData.speedUHC = {}
    userData.speedUHC.coins = playerData?.stats?.UHC?.coins ?? 0;
    userData.speedUHC.KD = ratio(playerData?.stats?.SpeedUHC?.kills, playerData?.stats?.SpeedUHC?.deaths);
    userData.speedUHC.WL = ratio(playerData?.stats?.SpeedUHC?.wins, playerData?.stats?.SpeedUHC?.deaths);
    userData.speedUHC.wins = playerData?.stats?.SpeedUHC?.wins ?? 0;
    userData.speedUHC.kills = playerData?.stats?.SpeedUHC?.kills ?? 0;
    userData.speedUHC.deaths = playerData?.stats?.SpeedUHC?.deaths ?? 0;
  
    userData.uhc = {}
    userData.uhc.level = 'I CANT ANYMROE AAAAAAA WHERE IT IS';//playerData?.stats?.UHC?.level;
    userData.uhc.coins = playerData?.stats?.UHC?.coins ?? 0;
    userData.uhc.KD = ratio(playerData?.stats?.UHC?.kills, playerData?.stats?.UHC?.deaths);
    userData.uhc.WL = ratio(playerData?.stats?.UHC?.wins, playerData?.stats?.UHC?.deaths);
    userData.uhc.wins = playerData?.stats?.UHC?.wins ?? 0;
    userData.uhc.kills = playerData?.stats?.UHC?.kills ?? 0;
    userData.uhc.deaths = playerData?.stats?.UHC?.deaths ?? 0;
  
    userData.walls = {}
    userData.walls.coins = playerData?.stats?.Walls?.coins ?? 0;
    userData.walls.KD = ratio(playerData?.stats?.Walls?.kills, playerData?.stats?.Walls?.deaths);
    userData.walls.WL = ratio(playerData?.stats?.Walls?.wins, playerData?.stats?.Walls?.losses);
    userData.walls.wins = playerData?.stats?.Walls?.wins ?? 0;
    userData.walls.kills = playerData?.stats?.Walls?.kills ?? 0;
    userData.walls.deaths = playerData?.stats?.Walls?.deaths ?? 0;
  
    userData.megaWalls = {}
    userData.megaWalls.coins = playerData?.stats?.Walls3?.coins ?? 0;
    userData.megaWalls.KD = ratio(playerData?.stats?.Walls3?.total_kills, playerData?.stats?.Walls3?.total_deaths);
    userData.megaWalls.WL = ratio(playerData?.stats?.Walls3?.wins, playerData?.stats?.Walls3?.losses);
    userData.megaWalls.wins = playerData?.stats?.Walls3?.wins ?? 0;
    userData.megaWalls.kills = playerData?.stats?.Walls3?.total_kills ?? 0;
    userData.megaWalls.deaths = playerData?.stats?.Walls3?.total_deaths ?? 0;
    
    function ratio(first, second) {
      if (!first || !first || first === 0 || second === 0) return 'Unavailable';
      return (first / second).toFixed(2);
    }
  
    return userData;
  } catch (err) {
    console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack)
    return err;
  }
}