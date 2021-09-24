errorEventCreate();

import * as storage from '../storage.js';

let outputElement = document.getElementById('outputElement');
let submitButton = document.getElementById('submitButton');

document.getElementById('clearButton').addEventListener('click', clearButton().catch(errorHandler));
document.getElementById('playerValue').addEventListener('input', invalidPlayer);

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

function invalidPlayer(event) {
  try {
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
    errorHandler(err);
  }
}

function errorEventCreate() {
  window.addEventListener('error', x => errorHandler(x, x.constructor.name));
  window.addEventListener('unhandledrejection', x => errorHandler(x, x.constructor.name));
}

function errorHandler(event, errorType = 'caughtError') { //Default type is "caughtError"
  try {
    let err = event?.error ?? event?.reason ?? event;
    let errorOutput = outputElement ?? document.getElementById('outputElement');
    console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - An ${errorType} occured.`, err?.stack ?? event);
    switch (err?.name) {
      case 'Unchecked runtime.lastError':
        errorOutput.innerHTML = `An error occured. ${err?.name}: ${err?.message}. That's all we know.`;
      break;
      case null:
      case undefined:
        errorOutput.innerHTML = `An error occured. No further information is available here; please check the dev console and contact Attituding#6517 if this error continues appearing.`;
      break;
      default:
        errorOutput.innerHTML = `An error occured. ${err?.name}: ${err?.message}. Please contact Attituding#6517 if this error continues appearing.`;
      break;
    }
  } catch (err) {
    console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - The error handler failed.`, err?.stack ?? event);
  }
}