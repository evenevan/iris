
const form = document.getElementById('submitPlayer');
form.addEventListener('submit', processPlayer);

const fetchTimeout = (url, ms, { signal, ...options } = {}) => { //Yoinked from https://stackoverflow.com/a/57888548 under CC BY-SA 4.0
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    if (signal) signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
};

function processPlayer(event) {
    event.preventDefault();
    let dataReturn = document.getElementById('dataReturn');
    let player = document.getElementById('player').value;
    document.getElementById('player').value = '';
    dataReturn.innerHTML = 'Loading..';
    chrome.storage.sync.get('userOptions', function(userOptions) {
      if (userOptions.userOptions.useHypixelAPI === true && !userOptions.userOptions.key) return dataReturn.innerHTML = 'You don\'t have a valid API key to use the Hypixel API! Either switch to the Slothpixel API in the options or use /api new on Hypixel and enter the key!';
      if (userOptions.userOptions.useHypixelAPI === true) {
        if (/^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/i.test(player)) return hypixelRequestPlayer(player, undefined, dataReturn, userOptions.userOptions);
        else return requestUUID(player, dataReturn, userOptions.userOptions);
      } else return slothpixelRequestPlayer(player, dataReturn, userOptions.userOptions);
    });
}

async function requestUUID(username, dataReturn, userOptions, undefinedIfHasntAborted) {
  let controller = new AbortController();
  Promise.all([
      fetchTimeout(`https://playerdb.co/api/player/minecraft/${username}`, 2000, {
        signal: controller.signal
      }).then(async function(response) {
        if (response.status === 500) {let newError = new Error("HTTP status " + response.status); newError.name = "NotFound"; throw newError;}
        if (!response.ok) {
          let responseJson = await response.json();
          let newError = new Error(`HTTP status ${response.status}; ${responseJson.cause}`);
          newError.name = "HTTPError";
          throw newError;
        }
        return response.json();
      })
    ])
    .then((response) => {
      hypixelRequestPlayer(response[0].data.player.id, username, dataReturn, userOptions);
    })
    .catch(async (err) => {
      if (err.name === "AbortError") {
          if (undefinedIfHasntAborted === undefined) return requestUUID(player, dataReturn, userOptions, true); //Simple way to try again without an infinite loop
          return dataReturn.innerHTML = "The UUID API failed to respond twice. It may be down. Try using a UUID or switch to the Slothpioxel API if this continues.";
      } else if (err.name === "NotFound") {
          return dataReturn.innerHTML = `The username "${username}" is not a valid player and was not found. <a href="https://namemc.com/search?q=${username}" target="_blank">NameMC</a>`;
      } else {
          return dataReturn.innerHTML = `An error occured while fetching the UUID. ${err.name}: ${err.message}. Try using a UUID or switch to the Slothpioxel API if this continues.`;
      }
  });
};

async function slothpixelRequestPlayer(player, dataReturn, userOptions, undefinedIfHasntAborted) {
    let controller = new AbortController();
    Promise.all([
        fetchTimeout(`https://api.slothpixel.me/api/players/${player}`, 2000, {
            signal: controller.signal
          }).then(async function(response) {
            if (response.status === 404) {let newError = new Error("HTTP status " + response.status); newError.name = "NotFound"; throw newError;}
            if (!response.ok) {
              let responseJson = await response.json();
              let newError = new Error(`HTTP status ${response.status}; ${responseJson.error}`);
              newError.name = "HTTPError";
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
              throw newError;
            }
            return response.json();
          })
      ])
      .then((player) => {
        slothpixelProcessData(player[0], player[1], dataReturn, userOptions);
      })
      .catch(async (err) => {
        if (err.name === "AbortError") {
            if (undefinedIfHasntAborted === undefined) return requestPlayer(player, dataReturn, userOptions, true); //Simple way to try again without an infinite loop
            return dataReturn.innerHTML = "The Slothpixel API failed to respond twice. It may be down. Try switching to the Hypixel API if this continues.";
        } else if (err.name === "NotFound") {
            let usernameOrUUID = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/i.test(player) ? 'UUID' : 'username';
            return dataReturn.innerHTML = `The ${usernameOrUUID} "${player}" is not a valid player and was not found. <a href="https://namemc.com/search?q=${player}" target="_blank">NameMC</a>`;
        } else {
            return dataReturn.innerHTML = `An error occured while fetching data from the Slothpixel API. ${err.name}: ${err.message}. Try switching to the Hypixel API if this continues.`;
        }
    });
}

async function slothpixelProcessData(playerData, statusData, dataReturn, userOptions) {
  try {
    let tzOffset =  new Date().getTimezoneOffset() / 60
    let tzOffsetString = `UTC${createOffset(new Date())}`

    let timeSinceLastLogin = `${secondsToDays(new Date() - playerData?.last_login)}${new Date(new Date() - playerData?.last_login).toISOString().substr(11, 8)}`,
        timeSinceLastLogout = `${secondsToDays(new Date() - playerData?.last_logout)}${new Date(new Date() - playerData?.last_logout).toISOString().substr(11, 8)}`;

    let lastLoginTimestamp = cleanDate(new Date(playerData?.last_login + tzOffset)) + ", " + new Date(playerData?.last_login + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let lastLogoutTimestamp = cleanDate(new Date(playerData?.last_logout + tzOffset)) + ", " + new Date(playerData?.last_logout + tzOffset).toLocaleTimeString('en-IN', { hour12: true });

    let lastPlaytime = `${secondsToDays(playerData?.last_logout - playerData?.last_login)}${new Date(playerData?.last_logout - playerData?.last_login).toISOString().substr(11, 8)}`;

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
    userData.username = playerData?.username ?? '';
    userData.possesive = playerData?.username?.endsWith('s') ? `${playerData?.username}'` : `${playerData?.username}'s`;
    userData.uuid = playerData?.uuid ?? '';
    userData.language = playerData?.language ?? 'Unavailable';
    userData.version = playerData?.playerData?.mc_version ?? 'Unavailable';
    userData.status = statusData.online && playerData?.last_login > playerData?.last_logout ? 'Online' : !statusData.online && playerData?.last_login < playerData?.last_logout ? 'Offline' : 'Unavailable';
    userData.isOnline = statusData?.online === true ? true : false; 

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

    userData.lastLogin = playerData?.last_login ? `${lastLoginTimestamp}<br>> ${timeSinceLastLogin} ago` : 'Unavailable';
    userData.lastLogout = playerData?.last_logout ? `${lastLogoutTimestamp}<br>> ${timeSinceLastLogout} ago` : 'Unavailable';
    userData.utcOffset = playerData?.last_login || playerData?.last_logout ? `<br><strong>UTC Offset Used:</strong> ${tzOffsetString}` : '';

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

    return formReply(userData, dataReturn, userOptions);
  } catch (err) {
    console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack)
    return dataReturn.innerHTML = `${err.name}: ${err.message}. Please contact Attituding#6517 if this error continues appearing.`;
  }
}

function hypixelRequestPlayer(uuid, username, dataReturn, userOptions, undefinedIfHasntAborted) {
  let controller = new AbortController();
  Promise.all([
      fetchTimeout(`https://api.hypixel.net/player?uuid=${uuid}&key=${userOptions.key}`, 2000, {
          signal: controller.signal
        }).then(async function(response) {
          if (!response.ok) {
            let responseJson = await response.json();
            let newError = new Error(`HTTP status ${response.status}; ${responseJson.cause}`);
            newError.name = "HTTPError";
            throw newError;
          }
          return response.json();
        }),
      fetchTimeout(`https://api.hypixel.net/status?uuid=${uuid}&key=${userOptions.key}`, 2000, {
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
      hypixelProcessData(player[0].player, player[1], dataReturn, userOptions);
    })
    .catch(async (err) => {
      if (err.name === "AbortError") {
          if (undefinedIfHasntAborted === undefined) return requestPlayer(player, dataReturn, userOptions, true); //Simple way to try again without an infinite loop
          return dataReturn.innerHTML = "The Hypixel API failed to respond twice. It may be down. Try switching to the Slothpixel API if this continues.";
      } else if (err.name === "NotFound") {
        return dataReturn.innerHTML = `The ${username ? 'username' : 'UUID'} "${username ?? uuid}" is not a valid player and was not found. <a href="https://namemc.com/search?q=${username ?? uuid}" target="_blank">NameMC</a>`;
      } else {
        return dataReturn.innerHTML = `An error occured while fetching data from the Hypixel API. ${err.name}: ${err.message}. Try switching to the Slothpixel API if this continues.`;
      }
  });
}

async function hypixelProcessData(playerData, statusData, dataReturn, userOptions) {
  try {
    let tzOffset =  new Date().getTimezoneOffset() / 60
    let tzOffsetString = `UTC${createOffset(new Date())}`
  
    let timeSinceLastLogin = `${secondsToDays(new Date() - playerData?.lastLogin)}${new Date(new Date() - playerData?.lastLogin).toISOString().substr(11, 8)}`,
        timeSinceLastLogout = `${secondsToDays(new Date() - playerData?.lastLogout)}${new Date(new Date() - playerData?.lastLogout).toISOString().substr(11, 8)}`;
  
    let lastLoginTimestamp = cleanDate(new Date(playerData?.lastLogin + tzOffset)) + ", " + new Date(playerData?.lastLogin + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let lastLogoutTimestamp = cleanDate(new Date(playerData?.lastLogout + tzOffset)) + ", " + new Date(playerData?.lastLogout + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
  
    let lastPlaytime = `${secondsToDays(playerData?.lastLogout - playerData?.lastLogin)}${new Date(playerData?.lastLogout - playerData?.lastLogin).toISOString().substr(11, 8)}`;
  
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
    userData.status = statusData?.session?.online && playerData?.lastLogin > playerData?.lastLogout ? 'Online' : !statusData?.session?.online && playerData?.lastLogin < playerData?.lastLogout ? 'Offline' : 'Unavailable';
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

    userData.lastLogin = playerData?.lastLogin ? `${lastLoginTimestamp}<br>> ${timeSinceLastLogin} ago` : 'Unavailable';
    userData.lastLogout = playerData?.lastLogout ? `${lastLogoutTimestamp}<br>> ${timeSinceLastLogout} ago` : 'Unavailable';
    userData.utcOffset = playerData?.lastLogin || playerData?.lastLogout ? `<br><strong>UTC Offset Used:</strong> ${tzOffsetString}` : '';

    userData.bedwars = {}
    userData.bedwars.level = playerData?.achievements.bedwars_level ?? 0;
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
    userData.skywars.level = playerData?.achievements.skywars_you_re_a_star ?? 0;
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

    return formReply(userData, dataReturn, userOptions);
  } catch (err) {
    console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack)
    return dataReturn.innerHTML = `${err.name}: ${err.message}. Please contact Attituding#6517 if this error continues appearing.`;
  }
}

function formReply(userData, dataReturn, userOptions) {
  try {
    console.log(new Date().toLocaleTimeString('en-IN', { hour12: true }), userData)
    let playerDataString = '';
  
    playerDataString += `<strong>Username:</strong> ${userData.username}<br>`;
    playerDataString += `<strong>UUID:</strong> ${userData.uuid}<br>`
  
    playerDataString += '<br>';
  
    playerDataString += `<strong>Language:</strong> ${userData.language}<br>`;
    playerDataString += `<strong>Version:</strong> ${userData.version}<br>`;
  
    playerDataString += '<br>';
  
    playerDataString += `<strong>Status:</strong> ${userData.status}<br>`;
  
    if (userData.isOnline === false) {
      playerDataString += `<strong>Last Playtime:</strong> ${userData.offline.playtime}<br>`;
      playerDataString += `<strong>Last Gametype:</strong> ${userData.offline.lastGame}<br>`;
    } else {
      playerDataString += `<strong>Playtime:</strong> ${userData.online.playtime}<br>`;
      playerDataString += `<strong>Game Type:</strong> ${userData.online.gameType}<br>`;
      playerDataString += `<strong>Game Mode:</strong> ${userData.online.mode}<br>`;
      playerDataString += `<strong>Game Map:</strong> ${userData.online.map}<br>`;
      if (!userData.online.gameType && !userData.online.mode && !userData.online.map) playerDataString += `<strong>Game Data: Not available! Limited API?<br>`;
    }
    
    playerDataString += `<strong>Last Login:</strong> ${userData.lastLogin}<br>`;
    playerDataString += `<strong>Last Logout:</strong> ${userData.lastLogout}`;
    playerDataString += userData.utcOffset;
  
    let playerPossesive = userData.possesive;
  
    if (userOptions.stats === true && (userData.online.gameType ?? userData.offline.lastGame)) switch (userData.online.gameType ?? userData.offline.lastGame) {
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
  
    return dataReturn.innerHTML = playerDataString;
  } catch (err) {
    console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack)
    return dataReturn.innerHTML = `${err.name}: ${err.message}. Please contact Attituding#6517 if this error continues appearing.`;
  }
}