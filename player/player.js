errorEventCreate();

import * as storage from '../storage.js';

document.getElementById('clearButton').addEventListener('click', () => clearButton().catch(errorHandler));
document.getElementById('playerValue').addEventListener('input', invalidPlayer);

async function clearButton() {
  try {
    let { playerHistory } = await storage.getLocalStorage('playerHistory').catch(errorHandler);
    document.getElementById('playerValue').value = '';
    document.getElementById('submitButton').disabled = true;
    document.getElementById('outputElement').innerHTML = '';
    playerHistory.lastSearchCleared = true;
    await storage.setLocalStorage({ playerHistory: playerHistory }).catch(errorHandler);
  } catch (err) {
    throw err;
  }
}

function invalidPlayer() {
  try {
    let submitButton = document.getElementById('submitButton');
    let uuid = /[0-9a-fA-F]{8}(-?)[0-9a-fA-F]{4}(-?)[1-5][0-9a-fA-F]{3}(-?)[89ABab][0-9a-fA-F]{3}(-?)[0-9a-fA-F]{12}/g;
    let username = /( ?)[a-zA-Z0-9_]{1,16}( ?)/g;
    console.log(this.value)
    if (username.test(this.value) || uuid.test(this.value)) {
      submitButton.value = 'Check Player';
      submitButton.disabled = false;
    } else if (this.value === '' || this.value === null) {
      submitButton.value = 'Check Player';
      submitButton.disabled = true;
    } else {
      submitButton.value = 'Invalid Player';
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

function errorHandler(event, errorType = 'caughtError', err =  event?.error ?? event?.reason ?? event) { //Default type is "caughtError"
  try {
    let errorOutput = document.getElementById('outputElement');
    console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Error Source: ${errorType} |`, err?.stack ?? event);
    switch (err?.name) {
      case 'ChromeError':
        errorOutput.innerHTML = `An error occured. ${err?.message}`;
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
    console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Error-Handler Failure |`, err?.stack ?? event);
  }
}