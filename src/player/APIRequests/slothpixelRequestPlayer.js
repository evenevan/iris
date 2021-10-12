import { createHTTPRequest } from "../../utility.js";
export function slothpixelRequestPlayer(player) {
  return Promise.all([
    createHTTPRequest(`https://api.slothpixel.me/api/players/${player}`, { "timeout": 5000 }),
    createHTTPRequest(`https://api.slothpixel.me/api/players/${player}/status`, { "timeout": 5000 }),
    createHTTPRequest(`https://api.slothpixel.me/api/players/${player}/recentGames`, { "timeout": 5000 })
  ])
  .then(data => slothpixelProcessData(data[0], data[1], data[2]))
  .catch(err => {
    if (err.status === 404) err.name = "NotFoundError";
    err.message = err.json?.error ?? `HTTP status of ${err.status}`;
    err.api = "Slothpixel";
    throw err;
  });
}

//eslint-disable-next-line complexity, max-lines-per-function, max-statements, max-lines-per-function
function slothpixelProcessData(playerData, statusData, recentGamesData) {
  const tzOffset = new Date().getTimezoneOffset() / 60,
  tzOffsetString = `UTC${createOffset(new Date())}`,

  firstLoginTime = new Date(playerData?.first_login ?? 0 + tzOffset).toLocaleTimeString("en-IN", { "hour12": true }),
  firstLoginDate = cleanDate(new Date(playerData?.first_login ?? 0 + tzOffset)),
  lastLoginTime = new Date(playerData?.last_login ?? 0 + tzOffset).toLocaleTimeString("en-IN", { "hour12": true }),
  lastLoginDate = cleanDate(new Date(playerData?.last_login ?? 0 + tzOffset)),
  lastLogoutTime = new Date(playerData?.last_logout ?? 0 + tzOffset).toLocaleTimeString("en-IN", { "hour12": true }),
  lastLogoutDate = cleanDate(new Date(playerData?.last_logout ?? 0 + tzOffset)),

  lastPlaytime = cleanTime(playerData?.last_logout - playerData?.last_login),

  apiData = {};
  apiData.username = playerData?.username ?? "";
  apiData.possesive = playerData?.username?.endsWith("s") ? `${playerData?.username ?? ""}'` : `${playerData?.username ?? ""}'s`;
  apiData.uuid = playerData?.uuid ?? null;
  apiData.language = playerData?.language ?? null;
  apiData.version = playerData?.mc_version ?? null;
  apiData.legacyAPI = playerData?.last_login < 1494864734000;
  apiData.status = statusData.online && playerData?.last_login > playerData?.last_logout ? "Online" : !statusData.online && playerData?.last_login < playerData?.last_logout ? "Offline" : !statusData.online && playerData?.last_login < 1494864734000 ? "Offline" : null;
  apiData.isOnline = statusData?.online === true;
  apiData.utcOffset = playerData?.last_login || playerData?.last_logout ? `${tzOffsetString}` : null;

  if (statusData?.online === true) {
    apiData.offline = {};
    apiData.offline.playtime = null;
    apiData.offline.lastGame = null;
    apiData.online = {};
    apiData.online.gameType = statusData?.game?.type ?? null;
    apiData.online.mode = statusData?.game?.mode ?? null;
    apiData.online.map = statusData?.game?.map ?? null;
  } else {
    apiData.offline = {};
    apiData.offline.playtime = playerData?.last_login && playerData?.last_login < playerData?.last_logout ? lastPlaytime : null;
    apiData.offline.lastGame = playerData?.last_game ?? null;
    apiData.online = {};
    apiData.online.gameType = null;
    apiData.online.mode = null;
    apiData.online.map = null;
  }

  apiData.firstLoginTime = playerData?.first_login ? firstLoginTime : null;
  apiData.firstLoginDate = playerData?.first_login ? firstLoginDate : null;
  apiData.firstLoginMS = playerData?.first_login ? playerData?.first_login : null;
  apiData.lastLoginTime = playerData?.last_login ? lastLoginTime : null;
  apiData.lastLoginDate = playerData?.last_login ? lastLoginDate : null;
  apiData.lastLoginMS = playerData?.last_login ? playerData?.last_login : null;
  apiData.lastLogoutTime = playerData?.last_logout ? lastLogoutTime : null;
  apiData.lastLogoutDate = playerData?.last_logout ? lastLogoutDate : null;
  apiData.lastLogoutMS = playerData?.last_logout ? playerData?.last_logout : null;

  apiData.recentGames = [];
  apiData.recentGamesPlayed = 0;

  //eslint-disable-next-line id-length
  for (let i = 0; i < recentGamesData?.length && recentGamesData?.[i]; i += 1) {
    apiData.recentGames[i] = {};
    apiData.recentGames[i].startTime = recentGamesData?.[i]?.date ? new Date(recentGamesData?.[i]?.date + tzOffset).toLocaleTimeString("en-IN", { "hour12": true }) : null;
    apiData.recentGames[i].startDate = recentGamesData?.[i]?.date ? cleanDate(new Date(recentGamesData?.[i]?.date + tzOffset)) : null;
    apiData.recentGames[i].startMS = recentGamesData?.[i]?.date ?? null;
    apiData.recentGames[i].endTime = recentGamesData?.[i]?.ended ? new Date(recentGamesData?.[i]?.ended + tzOffset).toLocaleTimeString("en-IN", { "hour12": true }) : null;
    apiData.recentGames[i].endDate = recentGamesData?.[i]?.ended ? cleanDate(new Date(recentGamesData?.[i]?.ended + tzOffset)) : null;
    apiData.recentGames[i].endMS = recentGamesData?.[i]?.ended ?? null;
    apiData.recentGames[i].gameLength = recentGamesData?.[i]?.date && recentGamesData?.[i]?.ended ? recentGamesData?.[i]?.ended - recentGamesData?.[i]?.date : null;
    apiData.recentGames[i].gameType = recentGamesData?.[i]?.gameType ?? null;
    apiData.recentGames[i].mode = recentGamesData?.[i]?.mode ?? null;
    apiData.recentGames[i].map = recentGamesData?.[i]?.map ?? null;
    if (recentGamesData[i]?.date < playerData?.last_login && recentGamesData?.[i]?.date > playerData?.last_logout) return;
    if (i <= 99) apiData.recentGamesPlayed += 1;
    else if (!isNaN(apiData.recentGamesPlayed)) apiData.recentGamesPlayed = `${apiData.recentGamesPlayed += 1}+`;
  }

  apiData.bedwars = {};
  apiData.bedwars.level = playerData?.stats?.BedWars?.level ?? 0;
  apiData.bedwars.coins = playerData?.stats?.BedWars?.coins ?? 0;
  apiData.bedwars.wins = playerData?.stats?.Bedwars?.wins_bedwars ?? 0;
  apiData.bedwars.gamesPlayed = playerData?.stats?.BedWars?.games_played ?? 0;
  apiData.bedwars.winStreak = playerData?.stats?.BedWars?.winstreak ?? 0;
  apiData.bedwars.finalKD = playerData?.stats?.BedWars?.final_k_d ?? 0;
  apiData.bedwars.KD = playerData?.stats?.BedWars.k_d ?? 0;

  apiData.duels = {};
  apiData.duels.coins = playerData?.stats?.Duels?.general?.coins ?? 0;
  apiData.duels.cosmetics = playerData?.stats?.Duels.general?.packages?.length ?? 0;
  apiData.duels.KD = playerData?.stats?.Duels?.general?.kd_ratio ?? 0;
  apiData.duels.WL = playerData?.stats?.Duels?.general?.win_loss_ratio ?? 0;
  apiData.duels.wins = playerData?.stats?.Duels?.general?.wins ?? 0;
  apiData.duels.kills = playerData?.stats?.Duels?.general?.kills ?? 0;
  apiData.duels.deaths = playerData?.stats?.Duels?.general?.deaths ?? 0;

  apiData.blitz = {};
  apiData.blitz.coins = playerData?.stats?.Blitz?.coins ?? 0;
  apiData.blitz.KD = playerData?.stats?.Blitz?.k_d ?? 0;
  apiData.blitz.WL = playerData?.stats?.Blitz?.win_loss ?? 0;
  apiData.blitz.wins = playerData?.stats?.Blitz?.wins ?? 0;
  apiData.blitz.kills = playerData?.stats?.Blitz?.kills ?? 0;
  apiData.blitz.deaths = playerData?.stats?.Blitz?.deaths ?? 0;

  apiData.pit = {};
  apiData.pit.gold = playerData?.stats?.Pit?.gold_earned;
  apiData.pit.prestige = playerData?.stats?.Pit?.prestige ?? 0;
  apiData.pit.playtime = playerData?.stats?.Pit?.playtime_minutes;
  apiData.pit.bestStreak = playerData?.stats?.Pit?.max_streak;
  apiData.pit.chatMessages = playerData?.stats?.Pit?.chat_messages;
  apiData.pit.KD = playerData?.stats?.Pit?.kd_ratio ?? 0;
  apiData.pit.kills = playerData?.stats?.Pit?.kills ?? 0;
  apiData.pit.deaths = playerData?.stats?.Pit?.deaths ?? 0;

  apiData.skywars = {};
  apiData.skywars.level = playerData?.stats?.SkyWars?.level;
  apiData.skywars.coins = playerData?.stats?.SkyWars?.coins ?? 0;
  apiData.skywars.KD = playerData?.stats?.SkyWars?.kill_death_ratio ?? 0;
  apiData.skywars.WL = playerData?.stats?.SkyWars?.win_loss_ratio ?? 0;
  apiData.skywars.wins = playerData?.stats?.SkyWars?.wins ?? 0;
  apiData.skywars.kills = playerData?.stats?.SkyWars?.kills ?? 0;
  apiData.skywars.deaths = playerData?.stats?.SkyWars?.deaths ?? 0;

  apiData.speedUHC = {};
  apiData.speedUHC.coins = playerData?.stats?.SpeedUHC?.coins ?? 0;
  apiData.speedUHC.KD = playerData?.stats?.SpeedUHC?.kd ?? 0;
  apiData.speedUHC.WL = playerData?.stats?.SpeedUHC?.win_loss ?? 0;
  apiData.speedUHC.wins = playerData?.stats?.SpeedUHC?.wins ?? 0;
  apiData.speedUHC.kills = playerData?.stats?.SpeedUHC?.kills ?? 0;
  apiData.speedUHC.deaths = playerData?.stats?.SpeedUHC?.deaths ?? 0;

  apiData.uhc = {};
  apiData.uhc.level = playerData?.stats?.UHC?.level ?? 0;
  apiData.uhc.coins = playerData?.stats?.UHC?.coins ?? 0;
  apiData.uhc.KD = playerData?.stats?.UHC?.kd ?? 0;
  apiData.uhc.WL = playerData?.stats?.UHC?.win_loss ?? 0;
  apiData.uhc.wins = playerData?.stats?.UHC?.wins ?? 0;
  apiData.uhc.kills = playerData?.stats?.UHC?.kills ?? 0;
  apiData.uhc.deaths = playerData?.stats?.UHC?.deaths ?? 0;
  apiData.walls = {};
  apiData.walls.coins = playerData?.stats?.Walls?.coins ?? 0;
  apiData.walls.KD = playerData?.stats?.UHC?.kd ?? 0;
  apiData.walls.WL = playerData?.stats?.UHC?.win_loss ?? 0;
  apiData.walls.wins = playerData?.stats?.Walls?.wins ?? 0;
  apiData.walls.kills = playerData?.stats?.Walls?.kills ?? 0;
  apiData.walls.deaths = playerData?.stats?.Walls?.deaths ?? 0;
  apiData.megaWalls = {};
  apiData.megaWalls.coins = playerData?.stats?.MegaWalls?.coins ?? 0;
  apiData.megaWalls.KD = playerData?.stats?.UHC?.kill_death_ratio ?? 0;
  apiData.megaWalls.WL = playerData?.stats?.UHC?.win_loss_ratio ?? 0;
  apiData.megaWalls.wins = playerData?.stats?.MegaWalls?.wins ?? 0;
  apiData.megaWalls.kills = playerData?.stats?.MegaWalls?.kills ?? 0;
  apiData.megaWalls.deaths = playerData?.stats?.MegaWalls?.deaths ?? 0;

  //Unsure as to why this doesnt work
  //eslint-disable-next-line consistent-return
  return apiData;
}

function cleanTime(ms) {
  if (ms < 0 || ms === null || isNaN(ms)) return null;
  let seconds = Math.round(ms / 1000);
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return days > 0
    ? `${days}d ${hours}h ${minutes}m ${seconds}s` : hours > 0
    ? `${hours}h ${minutes}m ${seconds}s` : minutes > 0
    ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function cleanDate(epoch) {
  const date = epoch.getDate(),
   month = new Intl.DateTimeFormat("en-US", { "month": "short" }).format(epoch),
   year = epoch.getFullYear();
  return `${month} ${date}, ${year}`;
}

//Yoinked from https://stackoverflow.com/a/13016136 under CC BY-SA 3.0 matching ISO 8601
function pad(value) {
  return value < 10 ? `0${value}` : value;
}

//Yoinked from https://stackoverflow.com/a/13016136 under CC BY-SA 3.0 matching ISO 8601
function createOffset(date) {
  const sign = date.getTimezoneOffset() > 0 ? "-" : "+",
   offset = Math.abs(date.getTimezoneOffset()),
   hours = pad(Math.floor(offset / 60)),
   minutes = pad(offset % 60);
  return `${sign + hours}:${minutes}`;
}
