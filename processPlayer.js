
import * as hypixelAPI from './APIRequests/hypixelAPIRequest.js';
import * as slothpixelAPI from './APIRequests/slothpixelAPIRequest.js';
import * as uuidAPI from './APIRequests/uuidAPIRequest.js';

const form = document.getElementById('submitPlayer');
form.addEventListener('submit', processPlayer);

async function processPlayer(event) {
    event.preventDefault();
    let dataReturn = document.getElementById('dataReturn');
    let player = document.getElementById('player').value.replace(/^\s/, '');
    document.getElementById('player').value = '';
    dataReturn.innerHTML = 'Loading..';
    chrome.storage.sync.get('userOptions', async function(userOptions) {
      if (userOptions.userOptions.useHypixelAPI === true && !userOptions.userOptions.apiKey) return dataReturn.innerHTML = 'You don\'t have a valid API key to use the Hypixel API! Either switch to the Slothpixel API in the options or use /api new on Hypixel and enter the key!';
      let userData = await callAPIs(player, userOptions.userOptions).catch(error => {errorHandler(error, player, userOptions.userOptions, dataReturn)})
      formReply(userData, dataReturn, userOptions.userOptions)
    });
}

async function callAPIs(player, userOptions) {
  let uuidRegex = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/i;
  console.log(userOptions)
  if (userOptions.useHypixelAPI === false) {
    return await slothpixelAPI.slothpixelRequestPlayer(player)
  } else if (uuidRegex.test(player)) {
    return await hypixelAPI.hypixelRequestPlayer(player, userOptions.apiKey)
  } else {
    let playerUUID = await uuidAPI.requestUUID(player)
    let x = await hypixelAPI.hypixelRequestPlayer(playerUUID, userOptions.apiKey)
    console.log(x)
    return x;
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
  
    if (userOptions.gameStats === true && (userData.online.gameType ?? userData.offline.lastGame)) switch (userData.online.gameType ?? userData.offline.lastGame) {
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
    return errorHandler(err, null, userOptions, dataReturn);
  }
}

function errorHandler(error, player, userOptions, dataReturn) {
  let apiType = userOptions.useHypixelAPI === true ? 'Hypixel API' : 'Slothpixel API'; //The UUID API could fail and not be counted, but switching to the Slothpixel API would fix it
  let oppositeAPIType = userOptions.useHypixelAPI === false ? 'Hypixel API' : 'Slothpixel API';
  let usernameOrUUID = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/i.test(player) ? 'UUID' : 'username';
  switch (error.name) {
    case 'AbortError':
      dataReturn.innerHTML = `The ${apiType} failed to respond twice. It may be down. Try switching to the ${oppositeAPIType} if this continues.`;
    break;
    case 'NotFound':
      dataReturn.innerHTML = `The ${usernameOrUUID} "${player}" isn't a valid player and couldn't be found. <a href="https://namemc.com/search?q=${player}" target="_blank">NameMC</a>`;
    break;
    case 'HTTPError':
      dataReturn.innerHTML = `An unexpected HTTP code was returned with the error ${error.message}. Try switching to the ${oppositeAPIType} if this continues.`;
    break;
    case 'RangeError':
      dataReturn.innerHTML = `A RangeError occured. Please contact Attituding#6517 with the extension version and the player you are trying to check.`;
    break;
    default:
      dataReturn.innerHTML = `An error occured. ${error.name}: ${error.message}. Try switching to the ${oppositeAPIType}. Please contact Attituding#6517 if this error continues appearing.`;
    break;
  }
}