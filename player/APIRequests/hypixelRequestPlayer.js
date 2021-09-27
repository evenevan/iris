const fetchTimeout = (url, ms, { signal, ...options } = {}) => { //Yoinked from https://stackoverflow.com/a/57888548 under CC BY-SA 4.0
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    if (signal) signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
};

export async function hypixelRequestPlayer(uuid, apiKey, timesAborted = 0) {
    let controller = new AbortController();
    return Promise.all([
        fetchTimeout(`https://api.hypixel.net/player?uuid=${uuid}&key=${apiKey}`, 2000, {
            signal: controller.signal
          }).then(async function(response) {
            if (!response.ok) {
              let responseJson = await response.json();
              let newError = new Error(`HTTP status ${response.status}; ${responseJson.cause}`);
              newError.name = "HTTPError";
              newError.status = response.status;
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
              newError.status = response.status;
              throw newError;
            }
            return response.json();
          })
      ])
      .then((player) => {
        if (player[0].player === null) {let newError = new Error(""); newError.name = "NotFound"; throw newError;}
        return hypixelProcessData(player[0].player, player[1]);
      })
      .catch(err => {
        if (err.name === "AbortError" && timesAborted < 1) return hypixelRequestPlayer(uuid, apiKey, timesAborted++); //Simple way to try again without an infinite loop
        throw err;
      });
};

async function hypixelProcessData(playerData, statusData) {
  try {
    let tzOffset =  new Date().getTimezoneOffset() / 60;
    let tzOffsetString = `UTC${createOffset(new Date())}`;

    let firstLoginTime = new Date((playerData?.firstLogin ?? 0) + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let firstLoginDate = cleanDate(new Date((playerData?.firstLogin ?? 0) + tzOffset));
    let lastLoginTime = new Date((playerData?.lastLogin ?? 0) + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let lastLoginDate = cleanDate(new Date((playerData?.lastLogin ?? 0) + tzOffset));
    let lastLogoutTime =  new Date((playerData?.lastLogout ?? 0) + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let lastLogoutDate = cleanDate(new Date((playerData?.lastLogout ?? 0) + tzOffset))
    
    let lastPlaytime = cleanTime((playerData?.lastLogout ?? 0) - (playerData?.lastLogin ?? 0));

    function cleanTime(ms) {
      if (ms < 0) return null;
      let seconds = Math.round(ms / 1000);
      let days = Math.floor(seconds / (24 * 60 * 60));
      seconds -= days * 24 * 60 * 60
      let hours = Math.floor(seconds / (60 * 60));
      seconds -= hours * 60 * 60
      let minutes = Math.floor(seconds / 60);
      seconds -= minutes * 60;
      return `${days > 0 ? `${days}d ${hours}h ${minutes}m ${seconds}s` : hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s` }`;
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
  
    let apiData = new Object();
    apiData.username = playerData?.displayname ?? '';
    apiData.possesive = playerData?.username?.endsWith('s') ? `${playerData?.displayname ?? ''}'` : `${playerData?.displayname ?? ''}'s`;
    apiData.uuid = playerData?.uuid ?? 'Unavailable';
    apiData.language = playerData?.userLanguage ?? 'Unavailable';
    apiData.version = playerData?.mcVersionRp ?? 'Unavailable';
    apiData.legacyAPI = playerData?.lastLogin < 149486473400 ? true : false;
    apiData.status = statusData?.session?.online && playerData?.lastLogin > playerData?.lastLogout ? 'Online' : !statusData?.session?.online && playerData?.lastLogin < playerData?.lastLogout ? 'Offline' : !statusData?.session?.online && playerData?.lastLogin < 1494864734000 ? 'Offline' : 'Unavailable';
    apiData.isOnline = statusData?.session?.online === true ? true : false;
    apiData.utcOffset = playerData?.lastLogin || playerData?.lastLogout ? `${tzOffsetString}` : 'Unavailable';
  
    if (statusData?.session?.online === true) {
      apiData.offline = {}
      apiData.offline.playtime = null;
      apiData.offline.lastGame = null;
      apiData.online = {}
      apiData.online.gameType = statusData?.session?.gameType ?? 'Unavailable';
      apiData.online.mode = statusData?.session?.mode ?? 'Unavailable';
      apiData.online.map = statusData?.session?.map ?? 'Unavailable';
    } else {
      apiData.offline = {}
      apiData.offline.playtime = playerData?.lastLogin && playerData?.lastLogin < playerData?.lastLogout ? lastPlaytime : 'Unavailable';
      apiData.offline.lastGame = playerData?.mostRecentGameType ?? 'Unavailable';
      apiData.online = {}
      apiData.online.gameType = null;
      apiData.online.mode = null;
      apiData.online.map = null;
    }

    apiData.firstLoginTime = playerData?.firstLogin ? firstLoginTime : 'Unavailable';
    apiData.firstLoginDate = playerData?.firstLogin ? firstLoginDate : 'Unavailable';
    apiData.firstLoginMS = playerData?.firstLogin ? playerData?.firstLogin : null;
    apiData.lastLoginTime = playerData?.lastLogin ? lastLoginTime : 'Unavailable';
    apiData.lastLoginDate = playerData?.lastLogin ? lastLoginDate : 'Unavailable';
    apiData.lastLoginMS = playerData?.lastLogin ? playerData?.lastLogin : null;
    apiData.lastLogoutTime = playerData?.lastLogout ? lastLogoutTime : 'Unavailable';
    apiData.lastLogoutDate = playerData?.lastLogout ? lastLogoutDate : 'Unavailable';
    apiData.lastLogoutMS = playerData?.lastLogout ? playerData?.lastLogout : null;
  
    apiData.bedwars = {}
    apiData.bedwars.level = playerData?.achievements?.bedwars_level ?? 0;
    apiData.bedwars.coins = playerData?.stats?.Bedwars?.coins ?? 0;
    apiData.bedwars.wins = playerData?.stats?.Bedwars?.wins_bedwars ?? 0;
    apiData.bedwars.gamesPlayed = playerData?.stats?.Bedwars?.games_played_bedwars ?? 0;
    apiData.bedwars.winStreak = playerData?.stats?.Bedwars?.winstreak ?? 0;
    apiData.bedwars.finalKD = ratio(playerData?.stats?.Bedwars?.final_kills_bedwars, playerData?.stats?.Bedwars?.final_deaths_bedwars);
    apiData.bedwars.KD = ratio(playerData?.stats?.Bedwars?.kills_bedwars, playerData?.stats?.Bedwars?.deaths_bedwars);
  
    apiData.duels = {}
    apiData.duels.coins = playerData?.stats?.Duels?.coins ?? 0;
    apiData.duels.cosmetics = playerData?.stats?.Duels?.packages?.length ?? 0;
    apiData.duels.KD = ratio(playerData?.stats?.Duels?.kills ?? 0, playerData?.stats?.Duels?.deaths ?? 0);
    apiData.duels.WL = ratio(playerData?.stats?.Duels?.wins ?? 0, playerData?.stats?.Duels?.deaths ?? 0);
    apiData.duels.wins = playerData?.stats?.Duels?.wins ?? 0;
    apiData.duels.kills = playerData?.stats?.Duels?.kills ?? 0;
    apiData.duels.deaths = playerData?.stats?.Duels?.deaths ?? 0
  
    apiData.blitz = {}
    apiData.blitz.coins = playerData?.stats?.HungerGames?.coins ?? 0;
    apiData.blitz.KD = ratio(playerData?.stats?.HungerGames?.kills, playerData?.stats?.HungerGames?.deaths);
    apiData.blitz.WL = ratio(playerData?.stats?.HungerGames?.wins, playerData?.stats?.HungerGames?.deaths);
    apiData.blitz.wins = playerData?.stats?.HungerGames?.wins ?? 0;
    apiData.blitz.kills = playerData?.stats?.HungerGames?.kills ?? 0;
    apiData.blitz.deaths = playerData?.stats?.HungerGames?.deaths ?? 0;
  
    apiData.pit = {}
    apiData.pit.gold = playerData?.stats?.Pit?.pit_stats_ptl?.cash_earned ?? 0;
    apiData.pit.prestige = playerData?.achievements?.pit_prestiges ?? 0;
    apiData.pit.playtime = playerData?.stats?.Pit?.pit_stats_ptl?.playtime_minutes;
    apiData.pit.bestStreak = playerData?.stats?.Pit?.pit_stats_ptl?.max_streak;
    apiData.pit.chatMessages = playerData?.stats?.Pit?.pit_stats_ptl?.chat_messages ?? 0;
    apiData.pit.KD = ratio(playerData?.stats?.Pit?.pit_stats_ptl?.kills, playerData?.stats?.Pit?.pit_stats_ptl?.deaths);
    apiData.pit.kills = playerData?.stats?.Pit?.pit_stats_ptl?.kills ?? 0;
    apiData.pit.deaths = playerData?.stats?.Pit?.pit_stats_ptl?.deaths ?? 0;
  
    apiData.skywars = {}
    apiData.skywars.level = playerData?.achievements?.skywars_you_re_a_star ?? 0;
    apiData.skywars.coins = playerData?.stats?.SkyWars?.coins ?? 0;
    apiData.skywars.KD = ratio(playerData?.stats?.SkyWars?.kills, playerData?.stats?.SkyWars?.deaths);
    apiData.skywars.WL = ratio(playerData?.stats?.SkyWars?.wins, playerData?.stats?.SkyWars?.losses);
    apiData.skywars.wins = playerData?.stats?.SkyWars?.wins ?? 0;
    apiData.skywars.kills = playerData?.stats?.SkyWars?.kills ?? 0;
    apiData.skywars.deaths = playerData?.stats?.SkyWars?.deaths ?? 0;
  
    apiData.speedUHC = {}
    apiData.speedUHC.coins = playerData?.stats?.UHC?.coins ?? 0;
    apiData.speedUHC.KD = ratio(playerData?.stats?.SpeedUHC?.kills, playerData?.stats?.SpeedUHC?.deaths);
    apiData.speedUHC.WL = ratio(playerData?.stats?.SpeedUHC?.wins, playerData?.stats?.SpeedUHC?.deaths);
    apiData.speedUHC.wins = playerData?.stats?.SpeedUHC?.wins ?? 0;
    apiData.speedUHC.kills = playerData?.stats?.SpeedUHC?.kills ?? 0;
    apiData.speedUHC.deaths = playerData?.stats?.SpeedUHC?.deaths ?? 0;
  
    apiData.uhc = {}
    apiData.uhc.level = 'I CANT ANYMROE AAAAAAA WHERE IT IS';//playerData?.stats?.UHC?.level;
    apiData.uhc.coins = playerData?.stats?.UHC?.coins ?? 0;
    apiData.uhc.KD = ratio(playerData?.stats?.UHC?.kills, playerData?.stats?.UHC?.deaths);
    apiData.uhc.WL = ratio(playerData?.stats?.UHC?.wins, playerData?.stats?.UHC?.deaths);
    apiData.uhc.wins = playerData?.stats?.UHC?.wins ?? 0;
    apiData.uhc.kills = playerData?.stats?.UHC?.kills ?? 0;
    apiData.uhc.deaths = playerData?.stats?.UHC?.deaths ?? 0;
  
    apiData.walls = {}
    apiData.walls.coins = playerData?.stats?.Walls?.coins ?? 0;
    apiData.walls.KD = ratio(playerData?.stats?.Walls?.kills, playerData?.stats?.Walls?.deaths);
    apiData.walls.WL = ratio(playerData?.stats?.Walls?.wins, playerData?.stats?.Walls?.losses);
    apiData.walls.wins = playerData?.stats?.Walls?.wins ?? 0;
    apiData.walls.kills = playerData?.stats?.Walls?.kills ?? 0;
    apiData.walls.deaths = playerData?.stats?.Walls?.deaths ?? 0;
  
    apiData.megaWalls = {}
    apiData.megaWalls.coins = playerData?.stats?.Walls3?.coins ?? 0;
    apiData.megaWalls.KD = ratio(playerData?.stats?.Walls3?.total_kills, playerData?.stats?.Walls3?.total_deaths);
    apiData.megaWalls.WL = ratio(playerData?.stats?.Walls3?.wins, playerData?.stats?.Walls3?.losses);
    apiData.megaWalls.wins = playerData?.stats?.Walls3?.wins ?? 0;
    apiData.megaWalls.kills = playerData?.stats?.Walls3?.total_kills ?? 0;
    apiData.megaWalls.deaths = playerData?.stats?.Walls3?.total_deaths ?? 0;
    
    function ratio(first, second) {
      if (!first || !first || first === 0 || second === 0) return 'Unavailable';
      return (first / second).toFixed(2);
    }
  
    return apiData;
  } catch (err) {
    console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack)
    return err;
  }
}