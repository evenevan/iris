import { errorHandler, getLocalStorage } from '../utility.js';

errorEventCreate();

(async () => {
  try {
    const outputElement = document.getElementById('outputElement');
    const playerHistory = await getLocalStorage('playerHistory');

    let playerHistoryArray = [];
      
    for (let i = 0; i < playerHistory?.lastSearches?.length ?? 0; i++) {
      let tempString = '';
      let searchEpoch = (playerHistory?.lastSearches[i]?.epoch) * 1 ?? 0
      let searchTime = new Date(searchEpoch).toLocaleTimeString('en-IN', { hour12: true });
      let searchDate = cleanDate(new Date(searchEpoch));
      tempString += `<b>#${i + 1} - ${searchEpoch ? `${searchTime}, ${searchDate} - ${cleanTime(timeAgo(searchEpoch))} ago` : 'Unavailable Ago'}</b><br>`;
      tempString += `&nbsp;&nbsp;<b>Input:</b> ${playerHistory?.lastSearches[i]?.input ?? 'Unavailable'}<br>`;
      tempString += `&nbsp;&nbsp;<b>Username:</b> ${playerHistory?.lastSearches[i]?.username ?? 'Unavailable'}<br>`;
      tempString += `&nbsp;&nbsp;<b>UUID:</b> ${playerHistory?.lastSearches[i]?.uuid ?? 'Unavailable'}<br>`;
      playerHistoryArray.push(tempString);
    }
    
    if (playerHistoryArray.length > 0) return outputElement.insertAdjacentHTML('afterbegin', playerHistoryArray.join("<br>"));
    else return outputElement.textContent = 'No recent searches!'
  } catch(err) {
    return errorHandler(err, document.getElementById('errorOutput'));
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
  window.addEventListener('error', x => errorHandler(x, document.getElementById('errorOutput'), x.constructor.name));
  window.addEventListener('unhandledrejection', x => errorHandler(x, document.getElementById('errorOutput'), x.constructor.name));
}