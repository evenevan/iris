errorEventCreate();

import * as storage from '../storage.js';

(async () => {
  let { userOptions } = await storage.getSyncStorage('userOptions').catch(errorHandler);
    
  if ((userOptions.paragraphOutput ?? false) === false) document.getElementById('authorNameOutputContainer').style.display = 'none';
  document.getElementById('typewriterOutput').checked = userOptions.typewriterOutput ?? true;
  document.getElementById('persistentLastPlayer').checked = userOptions.persistentLastPlayer ?? true;
  document.getElementById('paragraphOutput').checked = userOptions.paragraphOutput ?? false;
  document.getElementById('authorNameOutput').checked = userOptions.authorNameOutput ?? false;
  document.getElementById('gameStats').checked = userOptions.gameStats ?? true;
  document.getElementById('useHypixelAPI').checked = userOptions.useHypixelAPI ?? false;
  document.getElementById('apiKey').value = userOptions.apiKey ?? '';

  document.querySelectorAll("input[type=checkbox]").forEach(function(checkbox) {
    checkbox.addEventListener('change', async function() {
      try {
        if (this.id === 'paragraphOutput') this.checked === true ? 
        document.getElementById('authorNameOutputContainer').style.display = 'block' : 
        document.getElementById('authorNameOutputContainer').style.display = 'none';
        userOptions[this.id] = this.checked;
        await storage.setSyncStorage({'userOptions': userOptions}).catch(errorHandler);
      } catch (err) {
        throw err;
      }
    })
  });

  let apiKeyInput = document.getElementById('apiKey');
  apiKeyInput.addEventListener('input', async function() {
    try {
      let regex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[45][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/g
      if (regex.test(apiKeyInput.value) || apiKeyInput.value === '') {
        document.getElementById('apiKeyError').innerHTML = '';
        userOptions.apiKey = apiKeyInput.value;
        await storage.setSyncStorage({'userOptions': userOptions}).catch(errorHandler);
      } else {
        document.getElementById('apiKeyError').innerHTML = '&#9888; Invalid API key! Hypixel API keys follow the UUID v4 format. Get one with <b>/api</b> on Hypixel &#9888;';
      }
    } catch (err) {
      throw err;
    }
  });

  let localStorageBytes = await storage.localStorageBytes(null).catch(errorHandler); //null returns the total storage
  let syncStorageBytes = await storage.syncStorageBytes(null).catch(errorHandler);

  document.getElementById('localStorageBytes').innerHTML = `${(localStorageBytes / 1000).toFixed(2)}KB`
  document.getElementById('syncStorageBytes').innerHTML = `${(syncStorageBytes / 1000).toFixed(2)}KB`
})().catch(errorHandler);

function errorEventCreate() {
  window.addEventListener('error', x => errorHandler(x, x.constructor.name));
  window.addEventListener('unhandledrejection', x => errorHandler(x, x.constructor.name));
}

function errorHandler(event, errorType = 'caughtError') { //Default type is "caughtError"
  try {
    let err = event?.error ?? event?.reason ?? event;
    let errorOutput = document.getElementById('errorOutput');
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

//uuid for error tracing in the future
//absolutely incredible
function b(a){return a?Math.random().toString(16)[2]:(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,b)}
//https://gist.github.com/jed/982883
let uuid = () => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c =>(c^(window.crypto||window.msCrypto).getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
//https://gist.github.com/jed/982883#gistcomment-3644691