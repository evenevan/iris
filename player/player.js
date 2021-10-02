import { errorHandler, getLocalStorage, setLocalStorage } from '../utility.js';

errorEventCreate();

document.getElementById('submitButton').style.cursor = 'not-allowed'; //There isn't really any other decent spot to put this

document.getElementById('clearButton').addEventListener('click', () => clearButton().catch(x => errorHandler(x, document.getElementById('outputElement'))));
document.getElementById('playerValue').addEventListener('input', invalidPlayer);

async function clearButton() {
  let { playerHistory } = await getLocalStorage('playerHistory').catch(x => errorHandler(x, document.getElementById('outputElement')));
  document.getElementById('playerValue').value = '';
  document.getElementById('submitButton').disabled = true;
  document.getElementById('outputElement').textContent = '';
  playerHistory.lastSearchCleared = true;
  await setLocalStorage({ playerHistory: playerHistory }).catch(x => errorHandler(x, document.getElementById('outputElement')));
}

function invalidPlayer() {
  try {
    let submitButton = document.getElementById('submitButton');
    let uuid = /[0-9a-fA-F]{8}(-?)[0-9a-fA-F]{4}(-?)[1-5][0-9a-fA-F]{3}(-?)[89ABab][0-9a-fA-F]{3}(-?)[0-9a-fA-F]{12}/g;
    let username = /( ?)[a-zA-Z0-9_]{1,16}( ?)/g;
    if (username.test(this.value) || uuid.test(this.value)) {
      submitButton.disabled = false;
      submitButton.style.borderColor = '#FFFFFF'
      submitButton.style.cursor = 'pointer'
      this.style.borderColor = '#FFFFFF'
    } else if (this.value === '') {
      submitButton.disabled = true;
      submitButton.style.borderColor = '#FFFFFF'
      submitButton.style.cursor = 'not-allowed'
      this.style.borderColor = '#FFFFFF'
    } else {
      submitButton.disabled = true;
      submitButton.style.borderColor = '#FF5555'
      submitButton.style.cursor = 'not-allowed'
      this.style.borderColor = '#FF5555'
    }
  } catch (err) {
    errorHandler(err, document.getElementById('outputElement'));
  }
}

function errorEventCreate() {
  window.addEventListener('error', x => errorHandler(x, document.getElementById('outputElement'), x.constructor.name));
  window.addEventListener('unhandledrejection', x => errorHandler(x, document.getElementById('outputElement'), x.constructor.name));
}