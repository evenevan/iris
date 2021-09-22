(async () => {
    let { playerHistory } = await getLocalStorage('playerHistory');

    let outputElement = document.getElementById('outputElement');

    let playerHistoryArray = [];
      
    for (let i = 0; i < playerHistory?.lastSearches.length ?? 0; i++) {
      let tempString = '';
      let searchEpoch = playerHistory?.lastSearches[i]?.epoch * 1
      let searchString = new Date(searchEpoch ?? null);
      tempString += `<b>${searchString ? `${searchString.toLocaleString('en-IN', { hour12: true })} - ${cleanTime(timeAgo(searchEpoch))} ago` : 'Unavailable'}</b><br>`;
      tempString += `&nbsp;&nbsp;<b>Username:</b> ${playerHistory?.lastSearches[i]?.apiData?.username}<br>`;
      tempString += `&nbsp;&nbsp;<b>UUID:</b> ${playerHistory?.lastSearches[i]?.uuid}<br>`;
      playerHistoryArray.push(tempString);
    }
    
    outputElement.innerHTML = playerHistoryArray.join("<br>");
})();

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

function getLocalStorage(key){ //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}
  
function setLocalStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
     })
  )
}