import { errorHandler, errorEventCreate, getLocalStorage, setLocalStorage, getSyncStorage } from '../utility.js';
import { hypixelRequestPlayer } from './APIRequests/hypixelRequestPlayer.js';
import { slothpixelRequestPlayer } from './APIRequests/slothpixelRequestPlayer.js';
import { requestUUID } from './APIRequests/requestUUID.js';
import { detailMessage } from './messageComponents/detailMessage.js';
import { explanationMessage } from './messageComponents/explanationMessage.js';

errorEventCreate(window, document.getElementById('outputElement'));

const outputElement = document.getElementById('outputElement');

document.getElementById('submitPlayer').addEventListener('submit', processPlayer);

//Loads the last searched player on page load. If the last input threw an error, nothing is displayed
(async function persistentPage() {
  try {
    const userOptions = await getSyncStorage('userOptions');
    if (userOptions.persistentLastPlayer === false) return;
    const playerHistory = await getLocalStorage('playerHistory');
    if (!playerHistory?.lastSearches[0]?.apiData || playerHistory?.lastSearchCleared === true) return;
    const text = playerDataString(playerHistory?.lastSearches[0]?.apiData, userOptions);
    userOptions.typewriterOutput = false;
    outputField(text, userOptions, outputElement);
  } catch (err) {
    errorHandler(err, outputElement);
  }
})();

function processPlayer(event) {
  event.preventDefault();
  const playerValue = document.getElementById('playerValue'),
        submitButton = document.getElementById('submitButton'),
        input = playerValue.value.replace(/^\s/, '');

  outputElement.textContent = 'Loading..';
  playerValue.value = '';
  submitButton.disabled = true;
  submitButton.style.cursor = 'not-allowed';

  // eslint-disable-next-line max-statements
  return (async function data() {
    let apiData;
    try {
      const userOptions = await getSyncStorage('userOptions');
      if (userOptions.useHypixelAPI === true && !userOptions.apiKey) {
        const newError = new Error();
        newError.name = 'KeyError';
        throw newError;
      }
      apiData = await callAPIs(input, userOptions);
      const text = playerDataString(apiData, userOptions);
      return outputField(text, userOptions, outputElement);
    } catch (err) {
      err.input = input;
      return errorHandler(err, outputElement);
    } finally {
      updatePlayerHistory(input, apiData).catch(err => errorHandler(err, outputElement));
    }
  })();
}

//Returns a object of the requested player or throws an error
async function callAPIs(input, userOptions) {
  const uuidRegex = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/;
  if (userOptions.useHypixelAPI === false) return slothpixelRequestPlayer(input);
  else if (uuidRegex.test(input)) return hypixelRequestPlayer(input, userOptions.apiKey);

  const playerUUID = await requestUUID(input);
  return hypixelRequestPlayer(playerUUID, userOptions.apiKey);
}

//Returns a formatted message ready to be displayed
function playerDataString(apiData, userOptions) {
  if (userOptions.paragraphOutput === false) return detailMessage(apiData, userOptions);
  return explanationMessage(apiData, userOptions);
}

function outputField(text, userOptions) {
  if (userOptions?.typewriterOutput === false) {
      outputElement.textContent = '';
      return outputElement.insertAdjacentHTML('afterbegin', text);
    }

  return (async function typewriter() {
    for (let i = 0; i < text.length; i += 10) {
      outputElement.textContent = '';
      outputElement.insertAdjacentHTML('afterbegin', text.slice(0, i + 5).replace(/<\/$|<$/, ''));
      //Seems to be a good balance as Firefox does this alot slower for some reason
      // eslint-disable-next-line no-await-in-loop
      await new Promise(t => {
        setTimeout(t, text.length / 50);
      });
    }

    outputElement.textContent = '';
    return outputElement.insertAdjacentHTML('afterbegin', text);
  })().catch(err => errorHandler(err, outputElement));
}

function updatePlayerHistory(input, apiData) {
  const thisPlayerHistory = {};
  thisPlayerHistory.input = input ?? null;
  thisPlayerHistory.uuid = apiData?.uuid ?? null;
  thisPlayerHistory.username = apiData?.username ?? null;
  thisPlayerHistory.apiData = apiData ?? null;
  thisPlayerHistory.epoch = Date.now();

  return (async function update() {
    const playerHistory = await getLocalStorage('playerHistory');
    playerHistory?.lastSearches?.unshift(thisPlayerHistory);
    playerHistory?.lastSearches?.splice(100);
    playerHistory.lastSearchCleared = false;
    delete playerHistory?.lastSearches[1]?.apiData;
    return setLocalStorage({ playerHistory: playerHistory });
  })();
}
