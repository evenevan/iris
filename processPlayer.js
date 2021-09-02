
const form = document.getElementById('submitForm');
form.addEventListener('submit', processPlayer);

const fetchTimeout = (url, ms, { signal, ...options } = {}) => { //obviously not designed by me lol
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
    requestPlayer(player, dataReturn);
}

async function requestPlayer(player, dataReturn, undefinedIfHasntAborted) {
    let controller = new AbortController();
    Promise.all([
        fetchTimeout(`https://api.slothpixel.me/api/players/${player}/`, 2000, {
            signal: controller.signal
          }).then(function(response) {
            if (response.status === 404) {let newError = new Error("HTTP status " + response.status); newError.name = "NotFound"; throw newError;}
            if (!response.ok) {let newError = new Error("HTTP status " + response.status); newError.name = "HTTPError"; throw newError;}
            return response.json();
          }),
        fetchTimeout(`https://api.slothpixel.me/api/players/${player}/status/`, 2000, {
            signal: controller.signal
          }).then(function(response) {
            if (response.status === 404) {let newError = new Error("HTTP status " + response.status); newError.name = "NotFound"; throw newError;}
            if (!response.ok) {let newError = new Error("HTTP status " + response.status); newError.name = "HTTPError"; throw newError;}
            return response.json();
          })
      ])
      .then((player) => {
        if (player.hasOwnProperty('error')) {let newError = new Error(player.error); newError.name = "PlayerError"; throw newError;}
        processData(player[0], player[1], dataReturn);
      })
      .catch(async (err) => {
        if (err.name === "AbortError") {
            if (undefinedIfHasntAborted === undefined) return requestPlayer(player, dataReturn, true); //Simple way to try again without an infinite loop
            return dataReturn.innerHTML = "Slothpixel failed to respond twice. It may be down. Please try again later.";
        } else if (err.name === "NotFound") {

            return dataReturn.innerHTML = `The ${/^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/i.test(player) ? 'UUID' : 'username'} "${player}" is not a valid player and was not found.`;
        } else {
            return dataReturn.innerHTML = `Error: ${err.message}`;
        }
    });
}

async function processData(playerData, statusData, dataReturn) {
    let tzOffset =  new Date().getTimezoneOffset() / 60
    let tzOffsetString = `UTC${createOffset(new Date())}`

    let timeSinceLastLogin = `${secondsToDays(new Date() - playerData.last_login)}${new Date(new Date() - playerData.last_login).toISOString().substr(11, 8)}`,
        timeSinceLastLogout = `${secondsToDays(new Date() - playerData.last_logout)}${new Date(new Date() - playerData.last_logout).toISOString().substr(11, 8)}`;

    let lastLoginTimestamp = cleanDate(new Date(playerData.last_login + tzOffset)) + ", " + new Date(playerData.last_login + tzOffset).toLocaleTimeString('en-IN', { hour12: true });
    let lastLogoutTimestamp = cleanDate(new Date(playerData.last_logout + tzOffset)) + ", " + new Date(playerData.last_logout + tzOffset).toLocaleTimeString('en-IN', { hour12: true });

    let lastPlaytime = `${secondsToDays(playerData.last_logout - playerData.last_login)}${new Date(playerData.last_logout - playerData.last_login).toISOString().substr(11, 8)}`;

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

    let playerDataString = '';

    playerDataString += `<strong>Username:</strong> ${playerData.username}<br>`;
    playerDataString += `<strong>UUID:</strong> ${playerData.uuid}<br>`

    playerDataString += '<br>';

    playerDataString += `<strong>Language:</strong> ${playerData.language ? playerData.language : 'Unavailable'}<br>`;
    playerDataString += `<strong>Version:</strong> ${playerData.mc_version ? playerData.mc_version : 'Unavailable'}<br>`;

    playerDataString += '<br>';

    playerDataString += `<strong>Status:</strong> ${statusData.online && playerData.last_login > playerData.last_logout ? 'Online' : !statusData.online && playerData.last_login < playerData.last_logout ? 'Offline' : 'Unavailable'}<br>`;

    if (!statusData.online) {
        playerDataString += `<strong>Last Playtime:</strong> ${playerData.last_login && playerData.last_login < playerData.last_logout ? lastPlaytime : 'Unavailable'}<br>`;
        playerDataString += `<strong>Last Gametype:</strong> ${playerData.last_game ? playerData.last_game : 'Unavailable'}<br>`;
    } else {
        playerDataString += `<strong>Playtime:</strong> ${playerData.last_login ? timeSinceLastLogin : 'Unavailable'}<br>`;
        playerDataString += `<strong>Game Type:</strong> ${statusData.game.type ? statusData.game.type : 'Unavailable'}<br>`;
        playerDataString += `<strong>Game Mode:</strong> ${statusData.game.mode ? statusData.game.mode: 'Unavailable'}<br>`;
        playerDataString += `<strong>Game Map:</strong> ${statusData.game.map ? statusData.game.map : 'Unavailable'}<br>`;
        if (!statusData.game.type && !statusData.game.mode && !statusData.game.map) playerDataString += `<strong>Game Data: Not available! Limited API?<br>`;
    }
    
    playerDataString += `<strong>Last Login:</strong> ${playerData.last_login ? `${lastLoginTimestamp}<br>> ${timeSinceLastLogin} ago` : 'Unavailable'}<br>`;
    playerDataString += `<strong>Last Logout:</strong> ${playerData.last_logout ? `${lastLogoutTimestamp}<br>> ${timeSinceLastLogout} ago` : 'Unavailable'}`;
    playerDataString += playerData.last_login || playerData.last_logout ? `<br><strong>UTC Offset Used:</strong> ${tzOffsetString}` : '';


    let playerPossesive = playerData.username.endsWith('s') ? `${playerData.username}'` : `${playerData.username}'s`

    if (statusData.game.type || playerData.last_game) switch (statusData.game.type || playerData.last_game) {
        case 'Bed Wars':
        case 'BedWars':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for Bed Wars:</strong><br>Level: ${playerData.stats.BedWars.level}<br>Coins: ${playerData.stats.BedWars.coins}<br>Total Games Joined: ${playerData.stats.BedWars.games_played}<br>Winstreak: ${playerData.stats.BedWars.winstreak}<br>Final K/D: ${playerData.stats.BedWars.final_k_d}<br>K/D: ${playerData.stats.BedWars.k_d}`;
          break;
        case 'Duels':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for Duels:</strong><br>Coins: ${playerData.stats.Duels.general.coins}<br>Cosmetic Count: ${playerData.stats.Duels.general.packages.length}<br>K/D Ratio: ${playerData.stats.Duels.general.kd_ratio}<br>W/L Ratio: ${playerData.stats.Duels.general.win_loss_ratio}<br>Wins: ${playerData.stats.Duels.general.wins}<br>Kills: ${playerData.stats.Duels.general.kills}<br>Deaths: ${playerData.stats.Duels.general.deaths}`;
          break;
        case 'Blitz Survival Games':
        case 'Blitz':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for Blitz Survival:</strong><br>Coins: ${playerData.stats.Blitz.coins}<br>K/D Ratio: ${playerData.stats.Blitz.k_d}<br>W/L Ratio: ${playerData.stats.Blitz.win_loss}<br>Wins: ${playerData.stats.Blitz.wins}<br>Kills: ${playerData.stats.Blitz.kills}<br>Deaths: ${playerData.stats.Blitz.deaths}`;
          break;
        case 'Pit':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for the Pit:</strong><br>Total Gold Earned: ${playerData.stats.Pit.gold_earned}<br>Prestige: ${playerData.stats.Pit.prestige}<br>Playtime: ${playerData.stats.Pit.playtime_minutes} minutes<br>Best Streak: ${playerData.stats.Pit.max_streak}<br>Chat Messages: ${playerData.stats.Pit.chat_messages}<br>K/D Ratio: ${playerData.stats.Pit.kd_ratio}<br>Kills: ${playerData.stats.Pit.kills}<br>Deaths: ${playerData.stats.Pit.deaths}`;
          break;
        case 'SkyWars':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for SkyWars:</strong><br>Level: ${playerData.stats.SkyWars.level}<br>Coins: ${playerData.stats.SkyWars.coins}<br>K/D Ratio: ${playerData.stats.SkyWars.kill_death_ratio}<br>W/L Ratio: ${playerData.stats.SkyWars.win_loss_ratio}<br>Wins: ${playerData.stats.SkyWars.wins}<br>Kills: ${playerData.stats.SkyWars.kills}<br>Deaths: ${playerData.stats.SkyWars.deaths}`;
          break;
        case 'Speed UHC':
        case 'SpeedUHC':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for Speed UHC:</strong><br>Coins: ${playerData.stats.SpeedUHC.coins}<br>K/D Ratio: ${playerData.stats.SpeedUHC.kd}<br>W/L Ratio: ${playerData.stats.SpeedUHC.win_loss}<br>Wins: ${playerData.stats.SpeedUHC.wins}<br>Kills: ${playerData.stats.SpeedUHC.kills}<br>Deaths: ${playerData.stats.SpeedUHC.deaths}`;
          break;
        case 'UHC Champions':
        case 'UHC':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for UHC Champions:</strong><br>Level: ${playerData.stats.UHC.level}<br>Coins: ${playerData.stats.UHC.coins}<br>K/D Ratio: ${playerData.stats.UHC.kd}<br>W/L Ratio: ${playerData.stats.UHC.win_loss}<br>Wins: ${playerData.stats.UHC.wins}<br>Kills: ${playerData.stats.UHC.kills}<br>Deaths: ${playerData.stats.UHC.deaths}`;
          break;
        case 'Walls':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for the Walls:</strong><br>Coins: ${playerData.stats.Walls.coins}<br>K/D Ratio: ${playerData.stats.Walls.kd}<br>W/L Ratio: ${playerData.stats.Walls.win_loss}<br>Wins: ${playerData.stats.Walls.wins}<br>Kills: ${playerData.stats.Walls.kills}<br>Deaths: ${playerData.stats.Walls.deaths}`;
          break;
        case 'Mega Walls':
        case 'MegaWalls':
            playerDataString += `<br><br><strong>${playerPossesive} Stats for Mega Walls:</strong><br>Coins: ${playerData.stats.MegaWalls.coins}<br>K/D Ratio: ${playerData.stats.MegaWalls.kill_death_ratio}<br>W/L Ratio: ${playerData.stats.MegaWalls.win_loss_ratio}<br>Wins: ${playerData.stats.MegaWalls.wins}<br>Kills: ${playerData.stats.MegaWalls.kills}<br>Deaths: ${playerData.stats.MegaWalls.deaths}`;
          break;
    }

    return dataReturn.innerHTML = playerDataString;
}