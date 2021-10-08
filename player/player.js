import { errorHandler, getLocalStorage, setLocalStorage } from '../utility.js';

const outputElement = document.getElementById('outputElement');
const submitButton = document.getElementById('submitButton');

errorEventCreate();

document.getElementById('clearButton').addEventListener('click', clearButton);
document.getElementById('playerValue').addEventListener('input', invalidPlayer);

submitButton.style.cursor = 'not-allowed';

async function clearButton() {
  document.getElementById('playerValue').textContent = '';
  submitButton.disabled = true;
  outputElement.textContent = '';

  try {
    const playerHistory = await getLocalStorage('playerHistory');
    playerHistory.lastSearchCleared = true;
    return await setLocalStorage({ playerHistory: playerHistory });
  } catch(err) {
    return errorHandler(err, outputElement);
  }
}

function invalidPlayer() {
  try {
    const uuid = /^[0-9a-fA-F]{8}(-?)[0-9a-fA-F]{4}(-?)[1-5][0-9a-fA-F]{3}(-?)[89ABab][0-9a-fA-F]{3}(-?)[0-9a-fA-F]{12}$/;
    const username = /^( ?)[a-zA-Z0-9_]{1,16}( ?)$/;
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
    return errorHandler(err, outputElement);
  }
}

function errorEventCreate() {
  window.addEventListener('error', x => errorHandler(x, outputElement, x.constructor.name));
  window.addEventListener('unhandledrejection', x => errorHandler(x, outputElement, x.constructor.name));
}