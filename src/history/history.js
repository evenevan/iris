import { errorHandler, errorEventCreate, getLocalStorage, cleanDate, cleanTime, cleanLength, timeAgo } from '../utility.js';

errorEventCreate(window, document.getElementById('outputElement'));

(async function load() {
  try {
    const playerHistory = await getLocalStorage('playerHistory'),
    playerArray = prepareArray(playerHistory);
    await typeWriter(playerArray);
  } catch (err) {
    errorHandler(err, document.getElementById('outputElement'));
  }
})();

function prepareArray({
  lastSearches = [],
}) {
  const playerArray = [];
  for (let i = 0; i < lastSearches.length ?? 0; i += 1) {
    let tempString = '';
    const searchEpoch = Number(lastSearches[i].epoch),
      searchTime = cleanTime(new Date(searchEpoch)),
      searchDate = cleanDate(new Date(searchEpoch));
    tempString += `<b>#${i + 1} - ${searchTime}, ${searchDate} - ${cleanLength(timeAgo(searchEpoch))} ago</b><br>
      &nbsp;&nbsp;<b>Input:</b> ${lastSearches[i]?.input ?? 'Unavailable'}<br>
      &nbsp;&nbsp;<b>Username:</b> ${lastSearches[i]?.username ?? 'Unavailable'}<br>
      &nbsp;&nbsp;<b>UUID:</b> ${lastSearches[i]?.uuid ?? 'Unavailable'}<br>`;
    playerArray.push(tempString);
  }
  if (playerArray.length === 0) return ['No recent searches!'];
  return playerArray.join('SPLIT<br>SPLIT').split('SPLIT');
}

async function typeWriter(playerArray) {
  const outputElement = document.getElementById('outputElement');

  for (const search of playerArray) {
    outputElement.insertAdjacentHTML('beforeend', search);
    // eslint-disable-next-line no-await-in-loop
    await new Promise(t => {
      setTimeout(t, 0);
    });
  }
}
