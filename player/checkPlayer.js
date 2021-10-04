import { errorHandler, getLocalStorage, setLocalStorage, getSyncStorage } from '../utility.js';
import { hypixelRequestPlayer } from './APIRequests/hypixelRequestPlayer.js';
import { slothpixelRequestPlayer } from './APIRequests/slothpixelRequestPlayer.js';
import { requestUUID } from './APIRequests/requestUUID.js';
import { detailMessage } from './messageComponents/detailMessage.js';
import { explanationMessage } from './messageComponents/explanationMessage.js';

const outputElement = document.getElementById('outputElement');

errorEventCreate();

document.getElementById('submitPlayer').addEventListener('submit', processPlayer);

(async () => { //Loads the last searched player on page load. If the last input threw an error, nothing is displayed
  try {
    const { userOptions } = await getSyncStorage('userOptions');
    if (userOptions.persistentLastPlayer === false) return;
    const { playerHistory } = await getLocalStorage('playerHistory');
    if (!playerHistory?.lastSearches[0]?.apiData || playerHistory?.lastSearchCleared === true) return;
    const text = playerDataString(playerHistory?.lastSearches[0]?.apiData, userOptions);
    userOptions.typewriterOutput = false;
    return await outputField(text, userOptions, outputElement);
  } catch(err) {
    return errorHandler(err, outputElement);
  }
})();

async function processPlayer(event) {
  event.preventDefault();
  const playerValue = document.getElementById('playerValue');
  const submitButton = document.getElementById('submitButton');
  const input = playerValue.value.replace(/^\s/, ''); //The player name/UUID from <input>
  let apiData; //Data returned from Slothpixel/Hypixel

  outputElement.textContent = 'Loading..';
  playerValue.value = '';
  submitButton.disabled = true;
  submitButton.style.cursor = 'not-allowed';
  
  try {
    const { userOptions } = await getSyncStorage('userOptions');
    if (userOptions.useHypixelAPI === true && !userOptions.apiKey) {let x =  new Error(); x.name = 'KeyError'; throw x}
    apiData = await callAPIs(input, userOptions);
    const text = playerDataString(apiData, userOptions);
    return await outputField(text, userOptions, outputElement);
  } catch (err) {
    err.input = input; //Assigns input so that the error logger can read it
    return errorHandler(err, outputElement);
  } finally {
    await updatePlayerHistory(input, apiData).catch(x => errorHandler(x, outputElement)); //Cleaner with .catch
  }
}

async function callAPIs(input, userOptions) { //Returns a object of the requested player or throws an error
  const uuidRegex = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/;
  if (userOptions.useHypixelAPI === false) return await slothpixelRequestPlayer(input);
  else if (uuidRegex.test(input)) return await hypixelRequestPlayer(input, userOptions.apiKey);
  else {
    const playerUUID = await requestUUID(input);
    return await hypixelRequestPlayer(playerUUID, userOptions?.apiKey);
  }
}

function playerDataString(apiData, userOptions) { //Returns a formatted message ready to be displayed
  if (userOptions.paragraphOutput === false) return detailMessage(apiData, userOptions);
  else return explanationMessage(apiData, userOptions);
}

async function outputField(text, userOptions) {
  if (userOptions?.typewriterOutput === false) return outputElement.insertAdjacentHTML('afterbegin', text);
    
  for (let i = 0; i < text.length; i += 10) { //Typewriter effect
    outputElement.textContent = '';
    outputElement.insertAdjacentHTML('afterbegin', text.slice(0, i + 5).replace(/<\/$|<$/, ''));
    await new Promise(t => setTimeout(t, text.length / 50)); //Seems to be a good balance as Firefox does this alot slower for some reason
  }
  outputElement.textContent = '';
  outputElement.insertAdjacentHTML('afterbegin', text);
}

async function updatePlayerHistory(input, apiData) {
    const thisPlayerHistory = new Object();
    thisPlayerHistory.input = input ?? null;
    thisPlayerHistory.uuid = apiData?.uuid ?? null;
    thisPlayerHistory.username = apiData?.username ?? null;
    thisPlayerHistory.apiData = apiData ?? null;
    thisPlayerHistory.epoch = `${Date.now()}`;
  
    const { playerHistory } = await getLocalStorage('playerHistory');
    playerHistory?.lastSearches?.unshift(thisPlayerHistory);
    playerHistory?.lastSearches?.splice(100);
    playerHistory.lastSearchCleared = false;
    if (playerHistory?.lastSearches[1]?.apiData) delete playerHistory?.lastSearches[1]?.apiData;
    return await setLocalStorage({ 'playerHistory': playerHistory });
}

function errorEventCreate() {
  window.addEventListener('error', x => errorHandler(x, outputElement, x.constructor.name));
  window.addEventListener('unhandledrejection', x => errorHandler(x, outputElement, x.constructor.name));
}