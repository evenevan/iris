
import { hypixelRequestPlayer } from './APIRequests/hypixelRequestPlayer.js';
import { slothpixelRequestPlayer } from './APIRequests/slothpixelRequestPlayer.js';
import { requestUUID } from './APIRequests/requestUUID.js';
import { detailMessage } from './messageComponents/detailMessage.js';
import { explanationMessage } from './messageComponents/explanationMessage.js';

let outputElement = document.getElementById('outputElement');
document.getElementById('clearButton').addEventListener('click', clearButton);
document.getElementById('submitPlayer').addEventListener('submit', processPlayer);
persistentPlayer()

async function clearButton() {
  try {
    let { playerHistory } = await getLocalStorage('playerHistory');
    outputElement.innerHTML = '';
    playerHistory.lastSearchCleared = true;
    await setLocalStorage({ playerHistory: playerHistory });
  } catch (err) {
    return errorHandler(err, null, null, outputElement);
  }
}

async function persistentPlayer() {
  try {
    let { userOptions } = await getSyncStorage('userOptions');
    if (userOptions.persistentLastPlayer === false) return;
    let { playerHistory } = await getLocalStorage('playerHistory');
    if (playerHistory.lastSearches.length === 0 || playerHistory.lastSearchCleared === true) return;
    let text = playerDataString(playerHistory.lastSearches[0].apiData, userOptions);
    userOptions.typewriterOutput = false;
    return await outputField(text, outputElement, userOptions);
  } catch (err) {
    return errorHandler(err, null, null, outputElement);
  }
}

async function processPlayer(event) {
  event.preventDefault();
  let player = document.getElementById('playerValue').value.replace(/^\s/, '');
  let { userOptions } = await getSyncStorage('userOptions').catch((err) => {return errorHandler(err, player, null, outputElement)})
  try {
    if (userOptions.useHypixelAPI === true && !userOptions.apiKey) {let x =  new Error(); x.name = 'KeyError'; throw x}
    outputElement.innerHTML = 'Loading..';
    document.getElementById('playerValue').value = '';
    let apiData = await callAPIs(player, userOptions);
    let text = playerDataString(apiData, userOptions);
    outputField(text, outputElement, userOptions); //Not awaiting promise to get them to both execute at the same time
    return updatePlayerHistory(apiData); // ^
  } catch (err) {
    return errorHandler(err, player, userOptions, outputElement);
  }
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

function playerDataString(apiData, userOptions) {
  if (userOptions.paragraphOutput === false) return detailMessage(apiData, userOptions);
  else return explanationMessage(apiData, userOptions);
}

async function outputField(text, outputElement, userOptions) {
  if (userOptions.typewriterOutput === false) return outputElement.innerHTML = text;

  for (let i = 0; i < text.length; i += 2) {
    outputElement.innerHTML = text.slice(0, i + 1);
    await new Promise(t => setTimeout(t, 0));
  }
  return outputElement.innerHTML = text;
}

async function updatePlayerHistory(apiData) {
  let thisPlayerHistory = new Object();
  thisPlayerHistory.uuid = apiData.uuid && apiData.uuid !== "Unavailable" ? apiData.uuid : null; //Should never be null, but hey
  thisPlayerHistory.epoch = `${Date.now()}`;
  thisPlayerHistory.apiData = apiData;

  let { playerHistory } = await getLocalStorage('playerHistory');
  playerHistory.lastSearches.unshift(thisPlayerHistory);
  playerHistory.lastSearches.splice(7);
  playerHistory.lastSearchCleared = false;
  return await setLocalStorage({ playerHistory: playerHistory });
}

function errorHandler(err, player, userOptions, outputElement) {
  console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), err.stack);
  let apiType = userOptions?.useHypixelAPI === true ? 'Hypixel API' : 'Slothpixel API'; //The UUID API could fail, but switching to the Slothpixel API *would* fix it
  let oppositeAPIType = userOptions?.useHypixelAPI === false ? 'Hypixel API' : 'Slothpixel API';
  let usernameOrUUID = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/i.test(player) ? 'UUID' : 'username';
  switch (err.name) {
    case 'Unchecked runtime.lastError':
      outputElement.innerHTML = `An error occured. ${err.name}: ${err.message}. That's all we know.`;
    break;
    case 'AbortError':
      outputElement.innerHTML = `The ${apiType} failed to respond twice. It may be down. Try switching to the ${oppositeAPIType} if this persists.`;
    break;
    case 'NotFound':
      outputElement.innerHTML = `The ${usernameOrUUID} "${player}" isn't a valid player and couldn't be found. <a href="https://namemc.com/search?q=${player}" title="Opens a new tab to NameMC with your search query" target="_blank">NameMC</a>`;
    break;
    case 'HTTPError':
      if (err.status === 500 && userOptions?.useHypixelAPI === false) outputElement.innerHTML = `Slothpixel returned an error; this happens regularly. Try switching to the ${oppositeAPIType} if this persists.`;
      if (err.status === 403 && userOptions?.useHypixelAPI === true) outputElement.innerHTML = `Invalid API key! Please either switch to the Slothpixel API or get a new API key with <b>/api</b> on Hypixel.`;
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

function getLocalStorage(key){ //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}

function setLocalStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}

function getSyncStorage(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}

function setSyncStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.sync.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}