import { errorHandler, errorEventCreate, getLocalStorage } from '../utility.js';

errorEventCreate(window, document.getElementById('outputElement'));

(async function load() {
  try {
    const outputElement = document.getElementById('outputElement'),
    playerHistory = await getLocalStorage('playerHistory'),
    preparedString = prepareString(playerHistory);

    if (preparedString.length > 0) outputElement.insertAdjacentHTML('afterbegin', preparedString);
    else outputElement.textContent = 'No recent searches!';
  } catch (err) {
    errorHandler(err, document.getElementById('outputElement'));
  }
})();

function prepareString(playerHistory) {
  const playerHistoryArray = [];
  for (let i = 0; i < playerHistory?.lastSearches?.length ?? 0; i += 1) {
    let tempString = '';
    const searchEpoch = Number(playerHistory?.lastSearches[i]?.epoch) ?? 0,
    searchTime = new Date(searchEpoch).toLocaleTimeString('en-IN', { hour12: true }),
    searchDate = cleanDate(new Date(searchEpoch));
    tempString += `<b>#${i + 1} - ${searchEpoch ? `${searchTime}, ${searchDate} - ${cleanTime(timeAgo(searchEpoch))} ago` : 'Unavailable Ago'}</b><br>`;
    tempString += `&nbsp;&nbsp;<b>Input:</b> ${playerHistory?.lastSearches[i]?.input ?? 'Unavailable'}<br>`;
    tempString += `&nbsp;&nbsp;<b>Username:</b> ${playerHistory?.lastSearches[i]?.username ?? 'Unavailable'}<br>`;
    tempString += `&nbsp;&nbsp;<b>UUID:</b> ${playerHistory?.lastSearches[i]?.uuid ?? 'Unavailable'}<br>`;
    playerHistoryArray.push(tempString);
  }
  return playerHistoryArray.join('<br>');
}

function cleanDate(epoch) {
  const date = epoch.getDate(),
   month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(epoch),
   year = epoch.getFullYear();
  return `${month} ${date}, ${year}`;
}

function timeAgo(ms) {
  if (ms < 0 || ms === null || isNaN(ms)) return 'Unavailable';
  return Date.now() - ms;
}

function cleanTime(ms) {
  if (ms < 0 || ms === null || isNaN(ms)) return null;
  let seconds = Math.round(ms / 1000);
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return days > 0
    ? `${days}d ${hours}h ${minutes}m ${seconds}s` : hours > 0
    ? `${hours}h ${minutes}m ${seconds}s` : minutes > 0
    ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
