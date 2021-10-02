errorEventCreate();

import { errorHandler, getLocalStorage, setLocalStorage, getSyncStorage } from '../utility.js';
import { hypixelRequestPlayer } from './APIRequests/hypixelRequestPlayer.js';
import { slothpixelRequestPlayer } from './APIRequests/slothpixelRequestPlayer.js';
import { requestUUID } from './APIRequests/requestUUID.js';
import { detailMessage } from './messageComponents/detailMessage.js';
import { explanationMessage } from './messageComponents/explanationMessage.js';

let outputElement = document.getElementById('outputElement');
let player;

document.getElementById('submitPlayer').addEventListener('submit', x => processPlayer(x).catch(x => errorHandler(x, document.getElementById('outputElement'))));
persistentPlayer().catch(x => errorHandler(x, document.getElementById('outputElement')));

async function persistentPlayer() {
  let { userOptions } = await getSyncStorage('userOptions');
  if (userOptions.persistentLastPlayer === false) return;
  let { playerHistory } = await getLocalStorage('playerHistory');
  if (playerHistory?.lastSearches.length === 0 || playerHistory?.lastSearchCleared === true) return;
  let text = playerDataString(playerHistory?.lastSearches[0]?.apiData, userOptions);
  userOptions.typewriterOutput = false;
  return await outputField(text, userOptions, outputElement);
}

async function processPlayer(event) {
  event.preventDefault();
  player = document.getElementById('playerValue').value.replace(/^\s/, '');
  let { userOptions } = await getSyncStorage('userOptions');
  document.getElementById('playerValue').value = '';
  outputElement.textContent = 'Loading..';
  if (userOptions.useHypixelAPI === true && !userOptions.apiKey) {let x =  new Error(); x.name = 'KeyError'; throw x}
  let submitButton = document.getElementById('submitButton');
  submitButton.disabled = true;
  submitButton.style.cursor = 'not-allowed';
  let apiData = await callAPIs(player, userOptions);
  let text = playerDataString(apiData, userOptions);
  await updatePlayerHistory(apiData); //Might add a <promise>.catch to allow it to continue if this fails
  return await outputField(text, userOptions, outputElement);
}

async function callAPIs(player, userOptions) {
  try {
    let uuidRegex = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/;
    if (userOptions.useHypixelAPI === false) return await slothpixelRequestPlayer(player);
    else if (uuidRegex.test(player)) return await hypixelRequestPlayer(player, userOptions.apiKey);
    else {
      let playerUUID = await requestUUID(player);
      return await hypixelRequestPlayer(playerUUID, userOptions?.apiKey);
    }
  } catch (err) {
    err.player = player; //Assigns input so that the error logger can read it
    throw err;
  }
}

function playerDataString(apiData, userOptions) {
  if (userOptions.paragraphOutput === false) return detailMessage(apiData, userOptions);
  else return explanationMessage(apiData, userOptions);
}

async function outputField(text, userOptions, outputElement) {
  if (userOptions?.typewriterOutput === false) return outputElement.insertAdjacentHTML('afterbegin', text);
    
  for (let i = 0; i < text.length; i += 2) {
    outputElement.textContent = '';
    outputElement.insertAdjacentHTML('afterbegin', text.slice(0, i + 1).replace(/<\/$|<$/, ''));
    await new Promise(t => setTimeout(t, 0));
  }
}

async function updatePlayerHistory(apiData) {
    let thisPlayerHistory = new Object();
    thisPlayerHistory.uuid = apiData.uuid;
    thisPlayerHistory.username = apiData.username;
    thisPlayerHistory.epoch = `${Date.now()}`;
    thisPlayerHistory.apiData = apiData;
  
    let { playerHistory } = await getLocalStorage('playerHistory');
    playerHistory?.lastSearches?.unshift(thisPlayerHistory);
    playerHistory?.lastSearches?.splice(100);
    playerHistory.lastSearchCleared = false;
    if (playerHistory?.lastSearches[1]?.apiData) delete playerHistory?.lastSearches[1]?.apiData;
    return await setLocalStorage({ 'playerHistory': playerHistory });
}

function errorEventCreate() {
  window.addEventListener('error', x => errorHandler(x, document.getElementById('outputElement'), x.constructor.name));
  window.addEventListener('unhandledrejection', x => errorHandler(x, document.getElementById('outputElement'), x.constructor.name));
}