import * as storage from '../storage.js';

errorEventCreate()

let outputElement = document.getElementById('errorOutput');

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
})().catch(errorHandler);

function errorEventCreate() {
  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', errorHandler);
}

function errorHandler(event) {
  try {
    let errorType = event?.error ? 'Unhandled Error' : event?.reason ? 'Unhandled Promise Rejection' : 'error';
    let err = event?.error ?? event?.reason ?? event; //Unhandled error ?? Unhandled promise rejection ?? Error object
    let errorOutput = outputElement ?? document.getElementById('errorOutput');
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

function b(a){return a?Math.random().toString(16)[2]:(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,b)} 