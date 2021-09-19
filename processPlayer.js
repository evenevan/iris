
import { hypixelRequestPlayer } from './APIRequests/hypixelRequestPlayer.js';
import { slothpixelRequestPlayer } from './APIRequests/slothpixelRequestPlayer.js';
import { requestUUID } from './APIRequests/requestUUID.js';
import { detailMessage } from './messageComponents/detailMessage.js';
import { explanationMessage } from './messageComponents/explanationMessage.js';

const form = document.getElementById('submitPlayer');
form.addEventListener('submit', processPlayer);

async function processPlayer(event) {
  event.preventDefault();
  let outputElement = document.getElementById('outputElement');
  let player = document.getElementById('player').value.replace(/^\s/, '');
  document.getElementById('player').value = '';
  chrome.storage.sync.get('userData', async function(chromeStorage) {
    try {
      if (chromeStorage.userData.options.useHypixelAPI === true && !chromeStorage.userData.options.apiKey) {let x =  new Error(); x.name = 'KeyError'; throw x;}
      outputElement.innerHTML = 'Loading..';
      let apiData = await callAPIs(player, chromeStorage.userData);
      let text = playerDataString(apiData, chromeStorage.userData);
      await outputField(text, outputElement, chromeStorage.userData);
      await updatePlayerHistory(apiData, chromeStorage.userData)
    } catch (err) {
      errorHandler(err, player, chromeStorage.userData, outputElement);
    }
  });
}

async function callAPIs(player, userData) {
  let uuidRegex = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/i;
  if (userData.options.useHypixelAPI === false) return await slothpixelRequestPlayer(player);
  else if (uuidRegex.test(player)) return await hypixelRequestPlayer(player, userData.options.apiKey);
  else {
    let playerUUID = await requestUUID(player);
    return await hypixelRequestPlayer(playerUUID, userData.options.apiKey);
  }
}

function playerDataString(apiData, userData) {
  if (userData.options.paragraphOutput === false) return detailMessage(apiData, userData);
  else return explanationMessage(apiData, userData);
}

async function outputField(text, outputElement, userData) {
  if (userData.options.typewriterOutput === false) return outputElement.innerHTML = text;

  for (let i = 0; i < text.length; i += 2) {
    outputElement.innerHTML = text.slice(0, i + 1);
    await new Promise(t => setTimeout(t, 0));
  }
  outputElement.innerHTML = text;
}

async function updatePlayerHistory(apiData, userData) {
  userData.lastPlayer = apiData.uuid && apiData.uuid !== "Unavailable" ? apiData.uuid : null;
  return await chrome.storage.sync.set({'userData': userData}); //.catch is probably not nessessary, although attaching an error handler would be an upgrade
}

function errorHandler(err, player, userData, outputElement) {
  let apiType = userData.options.useHypixelAPI === true ? 'Hypixel API' : 'Slothpixel API'; //The UUID API could fail, but switching to the Slothpixel API *would* fix it
  let oppositeAPIType = userData.options.useHypixelAPI === false ? 'Hypixel API' : 'Slothpixel API';
  let usernameOrUUID = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/i.test(player) ? 'UUID' : 'username';
  switch (err.name) {
    case 'AbortError':
      outputElement.innerHTML = `The ${apiType} failed to respond twice. It may be down. Try switching to the ${oppositeAPIType} if this persists.`;
    break;
    case 'NotFound':
      outputElement.innerHTML = `The ${usernameOrUUID} "${player}" isn't a valid player and couldn't be found. <a href="https://namemc.com/search?q=${player}" title="Opens a new tab to NameMC with your search query" target="_blank">NameMC</a>`;
    break;
    case 'HTTPError':
      if (err.status === 500 && userData.options.useHypixelAPI === false) outputElement.innerHTML = `Slothpixel returned an error; this happens regularly. Try switching to the ${oppositeAPIType} if this persists.`;
      if (err.status === 403 && userData.options.useHypixelAPI === true) outputElement.innerHTML = `Invalid API key! Please either switch to the Slothpixel API or get a new API key with <b>/api</b> on Hypixel.`;
      else outputElement.innerHTML = `An unexpected HTTP code was returned. ${err.message}. Try switching to the ${oppositeAPIType} if this persists.`;
    break;
    case 'KeyError':
      outputElement.innerHTML = `You don't have an API key to use the Hypixel API! Either switch to the Slothpixel API in the options or use /api new on Hypixel and enter the key!`;
    break;
    case 'RangeError':
      outputElement.innerHTML = `A RangeError occured. Please contact Attituding#6517 with the extension version and the player you are trying to check.`;
    break;
    default:
      outputElement.innerHTML = `An error occured. ${err.name}: ${err.message}. Try switching to the ${oppositeAPIType}. Please contact Attituding#6517 if this error persists appearing.`;
    break;
  }
}