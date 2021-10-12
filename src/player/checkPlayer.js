/*eslint-disable id-length */
/*eslint-disable max-statements */
import { errorHandler, getLocalStorage, setLocalStorage, getSyncStorage } from "../utility.js";
import { hypixelRequestPlayer } from "./APIRequests/hypixelRequestPlayer.js";
import { slothpixelRequestPlayer } from "./APIRequests/slothpixelRequestPlayer.js";
import { requestUUID } from "./APIRequests/requestUUID.js";
import { detailMessage } from "./messageComponents/detailMessage.js";
import { explanationMessage } from "./messageComponents/explanationMessage.js";

const outputElement = document.getElementById("outputElement");

errorEventCreate();

document.getElementById("submitPlayer").addEventListener("submit", processPlayer);

//Loads the last searched player on page load. If the last input threw an error, nothing is displayed
(async () => {
  try {
    const userOptions = await getSyncStorage("userOptions");
    if (userOptions.persistentLastPlayer === false) return;
    const playerHistory = await getLocalStorage("playerHistory");
    if (!playerHistory?.lastSearches[0]?.apiData || playerHistory?.lastSearchCleared === true) return;
    const text = playerDataString(playerHistory?.lastSearches[0]?.apiData, userOptions);
    userOptions.typewriterOutput = false;
    await outputField(text, userOptions, outputElement);
  } catch (err) {
    errorHandler(err, outputElement);
  }
})();

async function processPlayer(event) {
  event.preventDefault();
  const playerValue = document.getElementById("playerValue"),
        submitButton = document.getElementById("submitButton"),
        //The player name/UUID from <input>
        input = playerValue.value.replace(/^\s/, "");

  //eslint-disable-next-line init-declarations
  let apiData;

  outputElement.textContent = "Loading..";
  playerValue.value = "";
  submitButton.disabled = true;
  submitButton.style.cursor = "not-allowed";

  try {
    const userOptions = await getSyncStorage("userOptions");
    if (userOptions.useHypixelAPI === true && !userOptions.apiKey) {
      const newError = new Error();
      newError.name = "KeyError";
      throw newError;
    }
    apiData = await callAPIs(input, userOptions);
    const text = playerDataString(apiData, userOptions);
    return outputField(text, userOptions, outputElement).catch(x => errorHandler(x, outputElement));
  } catch (err) {
    err.input = input;
    return errorHandler(err, outputElement);
  } finally {
    return updatePlayerHistory(input, apiData).catch(x => errorHandler(x, outputElement));
  }
}

//Returns a object of the requested player or throws an error
async function callAPIs(input, userOptions) {
  //eslint-disable-next-line prefer-named-capture-group
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

async function outputField(text, userOptions) {
  if (userOptions?.typewriterOutput === false) return outputElement.insertAdjacentHTML("afterbegin", text);

  //Typewriter effect
  for (let i = 0; i < text.length; i += 10) {
    outputElement.textContent = "";
    outputElement.insertAdjacentHTML("afterbegin", text.slice(0, i + 5).replace(/<\/$|<$/, ""));
    //Seems to be a good balance as Firefox does this alot slower for some reason
    //eslint-disable-next-line no-await-in-loop
    await new Promise(t => {
      setTimeout(t, text.length / 50);
    });
  }
  outputElement.textContent = "";
  return outputElement.insertAdjacentHTML("afterbegin", text);
}

async function updatePlayerHistory(input, apiData) {
    const thisPlayerHistory = {};
    thisPlayerHistory.input = input ?? null;
    thisPlayerHistory.uuid = apiData?.uuid ?? null;
    thisPlayerHistory.username = apiData?.username ?? null;
    thisPlayerHistory.apiData = apiData ?? null;
    thisPlayerHistory.epoch = `${Date.now()}`;

    const playerHistory = await getLocalStorage("playerHistory");
    playerHistory?.lastSearches?.unshift(thisPlayerHistory);
    playerHistory?.lastSearches?.splice(100);
    playerHistory.lastSearchCleared = false;
    delete playerHistory?.lastSearches[1]?.apiData;
    return setLocalStorage({ "playerHistory": playerHistory });
}

function errorEventCreate() {
  window.addEventListener("error", error => errorHandler(error, document.getElementById("errorOutput"), error.constructor.name));
  window.addEventListener("unhandledrejection", error => errorHandler(error, document.getElementById("errorOutput"), error.constructor.name));
  window.onerror = () => true;
}
