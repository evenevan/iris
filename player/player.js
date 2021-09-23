import * as storage from '../storage.js';

errorEventCreate();

let outputElement = document.getElementById('outputElement');
let submitButton = document.getElementById('submitButton');

document.getElementById('clearButton').addEventListener('click', clearButton().catch(errorHandler));
document.getElementById('playerValue').addEventListener('input', x => invalidPlayer(x).catch(errorHandler));

async function clearButton() {
  try {
    let { playerHistory } = await storage.getLocalStorage('playerHistory').catch(errorHandler);
    document.getElementById('playerValue').value = '';
    outputElement.innerHTML = '';
    playerHistory.lastSearchCleared = true;
    await storage.setLocalStorage({ playerHistory: playerHistory }).catch(errorHandler);
  } catch (err) {
    throw err;
  }
}

async function invalidPlayer(event) { //Probably a terrible idea to make it async just for the .catch. Seems to work though. Performance isn't really a concern.
  try {
    x - x
    let uuid = /[0-9a-fA-F]{8}(-?)[0-9a-fA-F]{4}(-?)[1-5][0-9a-fA-F]{3}(-?)[89ABab][0-9a-fA-F]{3}(-?)[0-9a-fA-F]{12}/g;
    let username = /( ?)[a-zA-Z0-9_]{1,16}( ?)/g;
    if (username.test(event.value) || uuid.test(event.value)) {
        submitButton.value = 'Check Player';
        submitButton.disabled = false;
    } else {
        submitButton.value = 'Invalid Player!';
        submitButton.disabled = true;
    }
  } catch (err) {
    throw err;
  }
}

function errorEventCreate() {
  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', errorHandler);
}

function errorHandler(event) {
  try {
    let errorType = event?.error ? 'Unhandled Error' : event?.reason ? 'Unhandled Promise Rejection' : 'error';
    let err = event?.error ?? event?.reason ?? event; //Unhandled error ?? Unhandled promise rejection ?? Error object
    let errorOutput = outputElement ?? document.getElementById('outputElement');
    console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - An ${errorType} occured.`, err.stack);
    //Discord Webhook here, make it conditonal for checkPlayer
    switch (err.name) {
      case 'Unchecked runtime.lastError':
        errorOutput.innerHTML = `An error occured. ${err.name}: ${err.message}. That's all we know.`;
      break;
      default:
        errorOutput.innerHTML = `An error occured. ${err.name}: ${err.message}. Please contact Attituding#6517 if this error continues appearing.`;
      break;
    }
  } catch (err) {
    console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - The error handler failed.`, err.stack);
  }
}