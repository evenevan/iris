errorEventCreate();

import { createHTTPRequest, getLocalStorage, setLocalStorage, localStorageBytes, getSyncStorage, setSyncStorage, syncStorageBytes } from '../utility.js';

(async () => {
  let { userOptions } = await getSyncStorage('userOptions').catch(errorHandler);

  let apiKeyInput = document.getElementById('apiKey');
  let apiKeyOutput = document.getElementById('apiKeyOutput');
  let testKey = document.getElementById('testKey');
  let uuidV4 = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[45][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/;
    
  if ((userOptions.paragraphOutput ?? false) === false) document.getElementById('authorNameOutputContainer').style.display = 'none';
  document.getElementById('typewriterOutput').checked = userOptions.typewriterOutput ?? true;
  document.getElementById('persistentLastPlayer').checked = userOptions.persistentLastPlayer ?? true;
  document.getElementById('paragraphOutput').checked = userOptions.paragraphOutput ?? false;
  document.getElementById('authorNameOutput').checked = userOptions.authorNameOutput ?? false;
  document.getElementById('gameStats').checked = userOptions.gameStats ?? true;
  document.getElementById('useHypixelAPI').checked = userOptions.useHypixelAPI ?? false;
  document.getElementById('apiKey').value = userOptions.apiKey.replace(/^[0-9a-fA-F]{8}/g, '########') ?? '';

  if (userOptions.apiKey === '') { //If there is no API key, disabled the "Test Key" button
    testKey.style.cursor = 'not-allowed'; testKey.disabled = true;
  } else {
    testKey.style.cursor = 'pointer'; testKey.disabled = false;;
  }

  document.querySelectorAll("input[type=checkbox]").forEach(function(checkbox) {
    checkbox.addEventListener('change', async function() {
      try {
        if (this.id === 'paragraphOutput') this.checked === true ? 
        document.getElementById('authorNameOutputContainer').style.display = 'block' : 
        document.getElementById('authorNameOutputContainer').style.display = 'none';
        userOptions[this.id] = this.checked;
        this.disabled = true;
        setTimeout(() => {this.disabled = false}, 500);
        await setSyncStorage({'userOptions': userOptions}).catch(errorHandler);
      } catch (err) {
        throw err;
      }
    })
  });

  apiKeyInput.addEventListener('input', async function() {
    try {
      userOptions.apiKey = this.value;
      if (uuidV4.test(this.value) || this.value === '') {
        apiKeyOutput.textContent = '';
        this.style.borderColor = '#FFFFFF';
        testKey.style.borderColor = '#FFFFFF';
        if (this.value === '') {
          testKey.style.cursor = 'not-allowed'; testKey.disabled = true;
        } else {
          testKey.style.cursor = 'pointer'; testKey.disabled = false;;
        }
        await setSyncStorage({'userOptions': userOptions}).catch(errorHandler);
      } else {
        testKey.style.cursor = 'not-allowed'; testKey.disabled = true; testKey.style.borderColor = '#FF5555';
        this.style.borderColor = '#FF5555';
        apiKeyOutput.style.color = '#FF5555';
        apiKeyOutput.textContent = '\u{26A0} Invalid API key! Hypixel API keys will follow the UUID v4 format. Get an API key with <b>/api new</b> on Hypixel \u{26A0}';
      }
    } catch (err) {
      throw err;
    }
  });

  apiKeyInput.addEventListener('focus', function() {
    try {
      this.value = userOptions.apiKey ?? '';
    } catch (err) {
      throw err;
    }
  });

  apiKeyInput.addEventListener('blur', function() {
    try {
      if (uuidV4.test(this.value)) this.value = userOptions.apiKey.replace(/^[0-9a-fA-F]{8}/gi, '########');
    } catch (err) {
      throw err;
    }
  });

  testKey.addEventListener('click', async function() {
    try {
      this.disabled = true;;
      setTimeout(() => {this.disabled = false;}, 500); //Prevent API Spam :)
      let response = await createHTTPRequest(`https://api.hypixel.net/key?key=${userOptions.apiKey}`);
      apiKeyOutput.style.color = '#FFFFFF';
      return apiKeyOutput.textContent = `\u{2713} Valid API Key! Total uses: ${response?.record?.totalQueries} \u{2713}`;
    } catch (err) {
      if (err?.status !== 403) return errorHandler(err);
      apiKeyOutput.style.color = '#FF5555';
      return apiKeyOutput.textContent = '\u{26A0} Invalid API key! Get a new API key with <b>/api new</b> on Hypixel \u{26A0}';
    }
  });

  let playerHistoryBytes = await localStorageBytes('playerHistory').catch(errorHandler); //null returns the total storage
  let userOptionsBytes = await syncStorageBytes('userOptions').catch(errorHandler);

  document.getElementById('playerHistoryBytes').textContent = `Search History: ${(playerHistoryBytes / 1024).toFixed(2)} Kilobytes`
  document.getElementById('userOptionsBytes').textContent = `Settings: ${(userOptionsBytes / 1024).toFixed(2)} Kilobytes`
})().catch(errorHandler);

function errorEventCreate() {
  window.addEventListener('error', x => errorHandler(x, x.constructor.name));
  window.addEventListener('unhandledrejection', x => errorHandler(x, x.constructor.name));
}

function errorHandler(event, errorType = 'caughtError', err =  event?.error ?? event?.reason ?? event) { //Default type is "caughtError"
  try {
    let errorOutput = document.getElementById('errorOutput');
    console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Error Source: ${errorType} |`, err?.stack ?? event);
    switch (err?.name) {
      case 'ChromeError':
        errorOutput.textContent = `An error occured. ${err?.message}`;
      break;
      case 'HTTPError':
        errorOutput.textContent = `An unexpected HTTP code was returned. ${err.message}. Please try again later and contact Attituding#6517 if this error continues appearing.`;
      break;
      case null:
      case undefined:
        errorOutput.textContent = `An error occured. No further information is available here; please check the dev console and contact Attituding#6517 if this error continues appearing.`;
      break;
      default:
        errorOutput.textContent = `An error occured. ${err?.name}: ${err?.message}. Please contact Attituding#6517 if this error continues appearing.`;
      break;
    }
  } catch (err) {
    console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Error-Handler Failure |`, err?.stack ?? event);
  }
}

//uuid for error tracing in the future - maybe.
//absolutely incredible
function b(a){return a?Math.random().toString(16)[2]:(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,b)}
//https://gist.github.com/jed/982883
let uuid = () => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c =>(c^(window.crypto||window.msCrypto).getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
//https://gist.github.com/jed/982883#gistcomment-3644691