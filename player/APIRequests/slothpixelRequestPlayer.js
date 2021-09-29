import { createHTTPRequest } from '../../utility.js';

export async function slothpixelRequestPlayer(player) {
  return Promise.all([
    createHTTPRequest(`https://api.slothpixel.me/api/players/${player}`, 5000),
    createHTTPRequest(`https://api.slothpixel.me/api/players/${player}/status`, 5000),
  ]).then((player) => {
    return slothpixelProcessData(player[0], player[1]);
  }).catch(err => {
    throw err;
  });
}

function slothpixelProcessData(playerData, statusData) {
  try {
    let tzOffset =  new Date().getTimezoneOffset() / 60;
    let tzOffsetString = `UTC${createOffset(new Date())}`;

    let firstLoginTime = new Date(playerData?.first_login ?? 0 + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let firstLoginDate = cleanDate(new Date(playerData?.first_login ?? 0 + tzOffset));
    let lastLoginTime = new Date(playerData?.last_login ?? 0 + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let lastLoginDate = cleanDate(new Date(playerData?.last_login ?? 0+ tzOffset));
    let lastLogoutTime =  new Date(playerData?.last_logout ?? 0 + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let lastLogoutDate = cleanDate(new Date(playerData?.last_logout ?? 0+ tzOffset));

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
  
    let apiData = new Object();
    apiData.username = playerData?.username ?? '';
    apiData.possesive = playerData?.username?.endsWith('s') ? `${playerData?.username ?? ''}'` : `${playerData?.username ?? ''}'s`;
    apiData.uuid = playerData?.uuid ?? 'Unavailable';
    apiData.language = playerData?.language ?? 'Unavailable';
    apiData.version = playerData?.mc_version ?? 'Unavailable';
    apiData.legacyAPI = playerData?.last_login < 1494864734000 ? true : false;
    apiData.status = statusData.online && playerData?.last_login > playerData?.last_logout ? 'Online' : !statusData.online && playerData?.last_login < playerData?.last_logout ? 'Offline' : !statusData.online && playerData?.last_login < 1494864734000 ? 'Offline' : 'Unavailable';
    apiData.isOnline = statusData?.online === true ? true : false; 
    apiData.utcOffset = playerData?.last_login || playerData?.last_logout ? `${tzOffsetString}` : 'Unavailable';

    if (statusData?.online === true) {
      apiData.offline = {}
      apiData.offline.playtime = null;
      apiData.offline.lastGame = null;
      apiData.online = {}
      apiData.online.gameType = statusData?.game?.type ?? 'Unavailable';
      apiData.online.mode = statusData?.game?.mode ?? 'Unavailable';
      apiData.online.map = statusData?.game?.map ?? 'Unavailable';
    } else {
      apiData.offline = {}
      apiData.offline.playtime = playerData?.last_login && playerData?.last_login < playerData?.last_logout ? lastPlaytime : 'Unavailable';
      apiData.offline.lastGame = playerData?.last_game ?? 'Unavailable';
      apiData.online = {}
      apiData.online.gameType = null;
      apiData.online.mode = null;
      apiData.online.map = null;
    }

    apiData.firstLoginTime = playerData?.first_login ? firstLoginTime : 'Unavailable';
    apiData.firstLoginDate = playerData?.first_login ? firstLoginDate : 'Unavailable';
    apiData.firstLoginMS = playerData?.first_login ? playerData?.first_login : null;
    apiData.lastLoginTime = playerData?.last_login ? lastLoginTime : 'Unavailable';
    apiData.lastLoginDate = playerData?.last_login ? lastLoginDate : 'Unavailable';
    apiData.lastLoginMS = playerData?.last_login ? playerData?.last_login : null;
    apiData.lastLogoutTime = playerData?.last_logout ? lastLogoutTime : 'Unavailable';
    apiData.lastLogoutDate = playerData?.last_logout ? lastLogoutDate : 'Unavailable';
    apiData.lastLogoutMS = playerData?.last_logout ? playerData?.last_logout : null;

    apiData.bedwars = {}
    apiData.bedwars.level = playerData?.stats?.BedWars?.level ?? 0;
    apiData.bedwars.coins = playerData?.stats?.BedWars?.coins ?? 0;
    apiData.bedwars.wins = playerData?.stats?.Bedwars?.wins_bedwars ?? 0;
    apiData.bedwars.gamesPlayed = playerData?.stats?.BedWars?.games_played ?? 0;
    apiData.bedwars.winStreak = playerData?.stats?.BedWars?.winstreak ?? 0;
    apiData.bedwars.finalKD = playerData?.stats?.BedWars?.final_k_d ?? 'Unavailable';
    apiData.bedwars.KD = playerData?.stats?.BedWars.k_d ?? 'Unavailable';

    apiData.duels = {}
    apiData.duels.coins = playerData?.stats?.Duels?.general?.coins ?? 0;
    apiData.duels.cosmetics = playerData?.stats?.Duels.general?.packages?.length ?? 0;
    apiData.duels.KD = playerData?.stats?.Duels?.general?.kd_ratio ?? 'Unavailable';
    apiData.duels.WL = playerData?.stats?.Duels?.general?.win_loss_ratio ?? 'Unavailable';
    apiData.duels.wins = playerData?.stats?.Duels?.general?.wins ?? 0;
    apiData.duels.kills = playerData?.stats?.Duels?.general?.kills ?? 0;
    apiData.duels.deaths = playerData?.stats?.Duels?.general?.deaths ?? 0

    apiData.blitz = {}
    apiData.blitz.coins = playerData?.stats?.Blitz?.coins ?? 0;
    apiData.blitz.KD = playerData?.stats?.Blitz?.k_d ?? 'Unavailable';
    apiData.blitz.WL = playerData?.stats?.Blitz?.win_loss ?? 'Unavailable';
    apiData.blitz.wins = playerData?.stats?.Blitz?.wins ?? 0;
    apiData.blitz.kills = playerData?.stats?.Blitz?.kills ?? 0;
    apiData.blitz.deaths = playerData?.stats?.Blitz?.deaths ?? 0;

    apiData.pit = {}
    apiData.pit.gold = playerData?.stats?.Pit?.gold_earned;
    apiData.pit.prestige = playerData?.stats?.Pit?.prestige ?? 0;
    apiData.pit.playtime = playerData?.stats?.Pit?.playtime_minutes;
    apiData.pit.bestStreak = playerData?.stats?.Pit?.max_streak;
    apiData.pit.chatMessages = playerData?.stats?.Pit?.chat_messages;
    apiData.pit.KD = playerData?.stats?.Pit?.kd_ratio ?? 'Unavailable';
    apiData.pit.kills = playerData?.stats?.Pit?.kills ?? 0;
    apiData.pit.deaths = playerData?.stats?.Pit?.deaths ?? 0;

    apiData.skywars = {}
    apiData.skywars.level = playerData?.stats?.SkyWars?.level;
    apiData.skywars.coins = playerData?.stats?.SkyWars?.coins ?? 0;
    apiData.skywars.KD = playerData?.stats?.SkyWars?.kill_death_ratio ?? 'Unavailable';
    apiData.skywars.WL = playerData?.stats?.SkyWars?.win_loss_ratio ?? 'Unavailable';
    apiData.skywars.wins = playerData?.stats?.SkyWars?.wins ?? 0;
    apiData.skywars.kills = playerData?.stats?.SkyWars?.kills ?? 0;
    apiData.skywars.deaths = playerData?.stats?.SkyWars?.deaths ?? 0;

    apiData.speedUHC = {}
    apiData.speedUHC.coins = playerData?.stats?.SpeedUHC?.coins ?? 0;
    apiData.speedUHC.KD = playerData?.stats?.SpeedUHC?.kd ?? 'Unavailable';
    apiData.speedUHC.WL = playerData?.stats?.SpeedUHC?.win_loss ?? 'Unavailable';
    apiData.speedUHC.wins = playerData?.stats?.SpeedUHC?.wins ?? 0;
    apiData.speedUHC.kills = playerData?.stats?.SpeedUHC?.kills ?? 0;
    apiData.speedUHC.deaths = playerData?.stats?.SpeedUHC?.deaths ?? 0;

    apiData.uhc = {}
    apiData.uhc.level = playerData?.stats?.UHC?.level ?? 0;
    apiData.uhc.coins = playerData?.stats?.UHC?.coins ?? 0;
    apiData.uhc.KD = playerData?.stats?.UHC?.kd ?? 'Unavailable';
    apiData.uhc.WL = playerData?.stats?.UHC?.win_loss ?? 'Unavailable';
    apiData.uhc.wins = playerData?.stats?.UHC?.wins ?? 0;
    apiData.uhc.kills = playerData?.stats?.UHC?.kills ?? 0;
    apiData.uhc.deaths = playerData?.stats?.UHC?.deaths ?? 0;

    apiData.walls = {}
    apiData.walls.coins = playerData?.stats?.Walls?.coins ?? 0;
    apiData.walls.KD = playerData?.stats?.UHC?.kd ?? 'Unavailable';
    apiData.walls.WL = playerData?.stats?.UHC?.win_loss ?? 'Unavailable';
    apiData.walls.wins = playerData?.stats?.Walls?.wins ?? 0;
    apiData.walls.kills = playerData?.stats?.Walls?.kills ?? 0;
    apiData.walls.deaths = playerData?.stats?.Walls?.deaths ?? 0;

    apiData.megaWalls = {}
    apiData.megaWalls.coins = playerData?.stats?.MegaWalls?.coins ?? 0;
    apiData.megaWalls.KD = playerData?.stats?.UHC?.kill_death_ratio ?? 'Unavailable';
    apiData.megaWalls.WL = playerData?.stats?.UHC?.win_loss_ratio ?? 'Unavailable';
    apiData.megaWalls.wins = playerData?.stats?.MegaWalls?.wins ?? 0;
    apiData.megaWalls.kills = playerData?.stats?.MegaWalls?.kills ?? 0;
    apiData.megaWalls.deaths = playerData?.stats?.MegaWalls?.deaths ?? 0;

    return apiData;
  } catch (err) {
    throw err;
  }
}