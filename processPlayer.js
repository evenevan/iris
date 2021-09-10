
import { hypixelRequestPlayer } from './APIRequests/hypixelRequestPlayer.js';
import { slothpixelRequestPlayer } from './APIRequests/slothpixelRequestPlayer.js';
import { requestUUID } from './APIRequests/requestUUID.js';
import { detailMessage } from './messageComponents/detailMessage.js';
import { explanationMessage } from './messageComponents/explanationMessage.js';

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
    try {
      let userData = await callAPIs(player, userOptions.userOptions)
      return dataReturn.innerHTML = playerDataString(userData, userOptions.userOptions);
    } catch (err) {
      errorHandler(err, player, userOptions.userOptions, dataReturn);
    }
  });
}

async function callAPIs(player, userOptions) {
  let uuidRegex = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/i;
  if (userOptions.useHypixelAPI === false) return await slothpixelRequestPlayer(player);
  else if (uuidRegex.test(player)) return await hypixelRequestPlayer(player, userOptions.apiKey);
  else {
    let playerUUID = await requestUUID(player);
    return await hypixelRequestPlayer(playerUUID, userOptions.apiKey);
  }
}

function playerDataString(userData, userOptions) {
  if (userOptions.paragraphOutput === false) return detailMessage(userData, userOptions);
  else return explanationMessage(userData, userOptions);
}

function errorHandler(err, player, userOptions, dataReturn) {
  let apiType = userOptions.useHypixelAPI === true ? 'Hypixel API' : 'Slothpixel API'; //The UUID API could fail and not be counted, but switching to the Slothpixel API *would* fix it
  let oppositeAPIType = userOptions.useHypixelAPI === false ? 'Hypixel API' : 'Slothpixel API';
  let usernameOrUUID = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/i.test(player) ? 'UUID' : 'username';
  switch (err.name) {
    case 'AbortError':
      dataReturn.innerHTML = `The ${apiType} failed to respond twice. It may be down. Try switching to the ${oppositeAPIType} if this continues.`;
    break;
    case 'NotFound':
      dataReturn.innerHTML = `The ${usernameOrUUID} "${player}" isn't a valid player and couldn't be found. <a href="https://namemc.com/search?q=${player}" title="Opens a new tab to NameMC with your search query" target="_blank">NameMC</a>`;
    break;
    case 'HTTPError':
      dataReturn.innerHTML = `An unexpected HTTP code was returned. ${err.message}. Try switching to the ${oppositeAPIType} if this continues.`;
    break;
    case 'RangeError':
      dataReturn.innerHTML = `A RangeError occured. Please contact Attituding#6517 with the extension version and the player you are trying to check.`;
    break;
    default:
      dataReturn.innerHTML = `An error occured. ${err.name}: ${err.message}. Try switching to the ${oppositeAPIType}. Please contact Attituding#6517 if this error continues appearing.`;
    break;
  }
}