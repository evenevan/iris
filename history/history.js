errorEventCreate();

import * as storage from '../storage.js';

(async () => {
  try {
    let { playerHistory } = await storage.getLocalStorage('playerHistory');

    let outputElement = document.getElementById('outputElement');

    let playerHistoryArray = [];
      
    for (let i = 0; i < playerHistory?.lastSearches?.length ?? 0; i++) {
      let tempString = '';
      let searchEpoch = (playerHistory?.lastSearches[i]?.epoch) * 1 ?? 0
      let searchTime = new Date(searchEpoch).toLocaleTimeString('en-IN', { hour12: true });
      let searchDate = cleanDate(new Date(searchEpoch));
      tempString += `<b>#${i + 1} - ${searchEpoch ? `${searchTime}, ${searchDate} - ${cleanTime(timeAgo(searchEpoch))} ago` : 'Unknown Ago'}</b><br>`;
      tempString += `&nbsp;&nbsp;<b>Username:</b> ${playerHistory?.lastSearches[i]?.username}<br>`;
      tempString += `&nbsp;&nbsp;<b>UUID:</b> ${playerHistory?.lastSearches[i]?.uuid}<br>`;
      playerHistoryArray.push(tempString);
    }
    
    if (playerHistoryArray.length > 0) {
      outputElement.innerHTML = playerHistoryArray.join("<br>");
    } else outputElement.innerHTML = 'No recent searches!'
  } catch(err) {
    errorHandler(err);
  }
})();

function cleanDate(epoch) {
  let date = epoch.getDate();
  let month = new Intl.DateTimeFormat('en-US', {month: 'short'}).format(epoch);
  let year = epoch.getFullYear();
  return month + " " + date + ", " + year;
}

function timeAgo(ms) {
  if (ms < 0 || ms === null || isNaN(ms)) return 'Unavailable';
  return Date.now() - ms;
}

function cleanTime(ms) { //Takes MS
  if (ms < 0 || ms === null || isNaN(ms)) return 'Unavailable';
  let seconds = Math.round(ms / 1000);
  let days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60
  let hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60
  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return `${days > 0 ? `${days}d ${hours}h ${minutes}m ${seconds}s` : hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s` }`;
}

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