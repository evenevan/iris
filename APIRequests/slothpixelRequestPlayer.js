const fetchTimeout = (url, ms, { signal, ...options } = {}) => { //Yoinked from https://stackoverflow.com/a/57888548 under CC BY-SA 4.0
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    if (signal) signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
};

export async function slothpixelRequestPlayer(player, undefinedIfHasntAborted) {
    let controller = new AbortController();
    return Promise.all([
        fetchTimeout(`https://api.slothpixel.me/api/players/${player}`, 2000, {
            signal: controller.signal
          }).then(async function(response) {
            if (response.status === 404) {let newError = new Error("HTTP status " + response.status); newError.name = "NotFound"; throw newError;}
            if (!response.ok) {
              let responseJson = await response.json();
              let newError = new Error(`HTTP status ${response.status}; ${responseJson.error}`);
              newError.name = "HTTPError";
              newError.status = response.status;
              throw newError;
            }
            return response.json();
          }),
        fetchTimeout(`https://api.slothpixel.me/api/players/${player}/status`, 2000, {
            signal: controller.signal
          }).then(async function(response) {
            if (response.status === 404) {let newError = new Error("HTTP status " + response.status); newError.name = "NotFound"; throw newError;}
            if (!response.ok) {
              let responseJson = await response.json();
              let newError = new Error(`HTTP status ${response.status}; ${responseJson.error}`);
              newError.name = "HTTPError";
              newError.status = response.status;
              throw newError;
            }
            return response.json();
          })
      ])
      .then((player) => {
        return slothpixelProcessData(player[0], player[1]);
      })
      .catch(async (err) => {
        if (err.name === "AbortError") {
            if (undefinedIfHasntAborted === undefined) return requestUUID(player, true); //Simple way to try again without an infinite loop
        }
        console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack);
        throw err;
      });
}

function slothpixelProcessData(playerData, statusData) {
  try {
    let tzOffset =  new Date().getTimezoneOffset() / 60;
    let tzOffsetString = `UTC${createOffset(new Date())}`;

    let timeSinceLastLogin = cleanTime(Date.now() - playerData?.last_login),
        timeSinceLastLogout = cleanTime(Date.now() - playerData?.last_logout);

    let lastLoginTimestamp = cleanDate(new Date(playerData?.last_login + tzOffset)) + ", " + new Date(playerData?.last_login + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let lastLogoutTimestamp = cleanDate(new Date(playerData?.last_logout + tzOffset)) + ", " + new Date(playerData?.last_logout + tzOffset).toLocaleTimeString('en-IN', { hour12: true });

    let lastPlaytime = cleanTime(playerData?.last_logout - playerData?.last_login);

    function cleanTime(ms) { //Takes MS
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
  
    let userData = new Object();
    userData.username = playerData?.username ?? '';
    userData.possesive = playerData?.username?.endsWith('s') ? `${playerData?.username ?? ''}'` : `${playerData?.username ?? ''}'s`;
    userData.uuid = playerData?.uuid ?? 'Unavailable';
    userData.language = playerData?.language ?? 'Unavailable';
    userData.version = playerData?.mc_version ?? 'Unavailable';
    userData.legacyAPI = playerData?.last_login < 149486473400 ? true : false;
    userData.status = statusData.online && playerData?.last_login > playerData?.last_logout ? 'Online' : !statusData.online && playerData?.last_login < playerData?.last_logout ? 'Offline' : !statusData.online && playerData?.last_login < 1494864734000 ? 'Offline' : 'Unavailable';
    userData.isOnline = statusData?.online === true ? true : false; 
    userData.utcOffset = playerData?.last_login || playerData?.last_logout ? `${tzOffsetString}` : 'Unavailable';

    if (statusData?.online === true) {
      userData.offline = {}
      userData.offline.playtime = null;
      userData.offline.lastGame = null;
      userData.online = {}
      userData.online.playtime = playerData?.last_login ? timeSinceLastLogin : 'Unavailable';
      userData.online.gameType = statusData?.game?.type ?? 'Unavailable';
      userData.online.mode = statusData?.game?.mode ?? 'Unavailable';
      userData.online.map = statusData?.game?.map ?? 'Unavailable';
    } else {
      userData.offline = {}
      userData.offline.playtime = playerData?.last_login && playerData?.last_login < playerData?.last_logout ? lastPlaytime : 'Unavailable';
      userData.offline.lastGame = playerData?.last_game ?? 'Unavailable';
      userData.online = {}
      userData.online.playtime = null;
      userData.online.gameType = null;
      userData.online.mode = null;
      userData.online.map = null;
    }

    userData.lastLoginStamp = playerData?.last_login ? lastLoginTimestamp : 'Unavailable';
    userData.lastLoginSince = playerData?.last_login ? timeSinceLastLogin : 'Unavailable';
    userData.lastLogoutStamp = playerData?.last_logout ? timeSinceLastLogin : 'Unavailable';
    userData.lastLogoutSince = playerData?.last_logout ? timeSinceLastLogout : 'Unavailable';

    userData.bedwars = {}
    userData.bedwars.level = playerData?.stats?.BedWars?.level ?? 0;
    userData.bedwars.coins = playerData?.stats?.BedWars?.coins ?? 0;
    userData.bedwars.wins = playerData?.stats?.Bedwars?.wins_bedwars ?? 0;
    userData.bedwars.gamesPlayed = playerData?.stats?.BedWars?.games_played ?? 0;
    userData.bedwars.winStreak = playerData?.stats?.BedWars?.winstreak ?? 0;
    userData.bedwars.finalKD = playerData?.stats?.BedWars?.final_k_d ?? 'Unavailable';
    userData.bedwars.KD = playerData?.stats?.BedWars.k_d ?? 'Unavailable';

    userData.duels = {}
    userData.duels.coins = playerData?.stats?.Duels?.general?.coins ?? 0;
    userData.duels.cosmetics = playerData?.stats?.Duels.general?.packages?.length ?? 0;
    userData.duels.KD = playerData?.stats?.Duels?.general?.kd_ratio ?? 'Unavailable';
    userData.duels.WL = playerData?.stats?.Duels?.general?.win_loss_ratio ?? 'Unavailable';
    userData.duels.wins = playerData?.stats?.Duels?.general?.wins ?? 0;
    userData.duels.kills = playerData?.stats?.Duels?.general?.kills ?? 0;
    userData.duels.deaths = playerData?.stats?.Duels?.general?.deaths ?? 0

    userData.blitz = {}
    userData.blitz.coins = playerData?.stats?.Blitz?.coins ?? 0;
    userData.blitz.KD = playerData?.stats?.Blitz?.k_d ?? 'Unavailable';
    userData.blitz.WL = playerData?.stats?.Blitz?.win_loss ?? 'Unavailable';
    userData.blitz.wins = playerData?.stats?.Blitz?.wins ?? 0;
    userData.blitz.kills = playerData?.stats?.Blitz?.kills ?? 0;
    userData.blitz.deaths = playerData?.stats?.Blitz?.deaths ?? 0;

    userData.pit = {}
    userData.pit.gold = playerData?.stats?.Pit?.gold_earned;
    userData.pit.prestige = playerData?.stats?.Pit?.prestige ?? 0;
    userData.pit.playtime = playerData?.stats?.Pit?.playtime_minutes;
    userData.pit.bestStreak = playerData?.stats?.Pit?.max_streak;
    userData.pit.chatMessages = playerData?.stats?.Pit?.chat_messages;
    userData.pit.KD = playerData?.stats?.Pit?.kd_ratio ?? 'Unavailable';
    userData.pit.kills = playerData?.stats?.Pit?.kills ?? 0;
    userData.pit.deaths = playerData?.stats?.Pit?.deaths ?? 0;

    userData.skywars = {}
    userData.skywars.level = playerData?.stats?.SkyWars?.level;
    userData.skywars.coins = playerData?.stats?.SkyWars?.coins ?? 0;
    userData.skywars.KD = playerData?.stats?.SkyWars?.kill_death_ratio ?? 'Unavailable';
    userData.skywars.WL = playerData?.stats?.SkyWars?.win_loss_ratio ?? 'Unavailable';
    userData.skywars.wins = playerData?.stats?.SkyWars?.wins ?? 0;
    userData.skywars.kills = playerData?.stats?.SkyWars?.kills ?? 0;
    userData.skywars.deaths = playerData?.stats?.SkyWars?.deaths ?? 0;

    userData.speedUHC = {}
    userData.speedUHC.coins = playerData?.stats?.SpeedUHC?.coins ?? 0;
    userData.speedUHC.KD = playerData?.stats?.SpeedUHC?.kd ?? 'Unavailable';
    userData.speedUHC.WL = playerData?.stats?.SpeedUHC?.win_loss ?? 'Unavailable';
    userData.speedUHC.wins = playerData?.stats?.SpeedUHC?.wins ?? 0;
    userData.speedUHC.kills = playerData?.stats?.SpeedUHC?.kills ?? 0;
    userData.speedUHC.deaths = playerData?.stats?.SpeedUHC?.deaths ?? 0;

    userData.uhc = {}
    userData.uhc.level = playerData?.stats?.UHC?.level ?? 0;
    userData.uhc.coins = playerData?.stats?.UHC?.coins ?? 0;
    userData.uhc.KD = playerData?.stats?.UHC?.kd ?? 'Unavailable';
    userData.uhc.WL = playerData?.stats?.UHC?.win_loss ?? 'Unavailable';
    userData.uhc.wins = playerData?.stats?.UHC?.wins ?? 0;
    userData.uhc.kills = playerData?.stats?.UHC?.kills ?? 0;
    userData.uhc.deaths = playerData?.stats?.UHC?.deaths ?? 0;

    userData.walls = {}
    userData.walls.coins = playerData?.stats?.Walls?.coins ?? 0;
    userData.walls.KD = playerData?.stats?.UHC?.kd ?? 'Unavailable';
    userData.walls.WL = playerData?.stats?.UHC?.win_loss ?? 'Unavailable';
    userData.walls.wins = playerData?.stats?.Walls?.wins ?? 0;
    userData.walls.kills = playerData?.stats?.Walls?.kills ?? 0;
    userData.walls.deaths = playerData?.stats?.Walls?.deaths ?? 0;

    userData.megaWalls = {}
    userData.megaWalls.coins = playerData?.stats?.MegaWalls?.coins ?? 0;
    userData.megaWalls.KD = playerData?.stats?.UHC?.kill_death_ratio ?? 'Unavailable';
    userData.megaWalls.WL = playerData?.stats?.UHC?.win_loss_ratio ?? 'Unavailable';
    userData.megaWalls.wins = playerData?.stats?.MegaWalls?.wins ?? 0;
    userData.megaWalls.kills = playerData?.stats?.MegaWalls?.kills ?? 0;
    userData.megaWalls.deaths = playerData?.stats?.MegaWalls?.deaths ?? 0;

    return userData;
  } catch (err) {
    console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack);
    throw err;
  }
}