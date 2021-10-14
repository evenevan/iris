/*eslint-disable prefer-named-capture-group */
import { errorHandler, errorEventCreate, getLocalStorage, setLocalStorage } from '../utility.js';

const outputElement = document.getElementById('outputElement'),
      submitButton = document.getElementById('submitButton');

errorEventCreate(window, document.getElementById('errorOutput'));

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
  } catch (err) {
    return errorHandler(err, outputElement);
  }
}

//eslint-disable-next-line max-statements
function invalidPlayer(input) {
  try {
    const uuid = /^[0-9a-fA-F]{8}(-?)[0-9a-fA-F]{4}(-?)[1-5][0-9a-fA-F]{3}(-?)[89ABab][0-9a-fA-F]{3}(-?)[0-9a-fA-F]{12}$/,
          username = /^( ?)[a-zA-Z0-9_]{1,16}( ?)$/;
    if (username.test(input.target.value) || uuid.test(input.target.value)) {
      submitButton.disabled = false;
      submitButton.style.borderColor = '#FFFFFF';
      submitButton.style.cursor = 'pointer';
      input.target.style.borderColor = '#FFFFFF';
    } else if (input.target.value === '') {
      submitButton.disabled = true;
      submitButton.style.borderColor = '#FFFFFF';
      submitButton.style.cursor = 'not-allowed';
      input.target.style.borderColor = '#FFFFFF';
    } else {
      submitButton.disabled = true;
      submitButton.style.borderColor = '#FF5555';
      submitButton.style.cursor = 'not-allowed';
      input.target.style.borderColor = '#FF5555';
    }
  } catch (err) {
    errorHandler(err, outputElement);
  }
}
