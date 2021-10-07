/*global chrome*/

let userOptions = {
  typewriterOutput: true,
  persistentLastPlayer: true,
  firstLogin: true,
  gameStats: true,
  paragraphOutput: false,
  authorNameOutput: false,
  useHypixelAPI: false,
  apiKey: ''
}

let playerHistory = {
  lastSearchCleared: false,
  lastSearches: []
}

chrome.runtime.onInstalled.addListener(async function(details) {
  if (details.reason == "install") { //On first install

    let setStorage = await Promise.allSettled([
      setSyncStorage({ 'userOptions': userOptions }),
      setLocalStorage({ 'playerHistory': playerHistory })
    ])

    if (setStorage.filter(x => x.status === 'rejected').length > 0) return console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Storage API`, setStorage)
    else return console.log(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Set storage on install`);
  
  } else if (details.reason == "update") {
    
    getSyncStorage('userOptions') //Repairs any missing or undefined values
      .then(x => {
        let userOptionsMissingValue = false;
        let userUserOptions = x.userOptions ?? {};
        Object.entries(userOptions).forEach(entry => {
          let [defaultKey, defaultValue] = entry;
          if (userUserOptions[defaultKey] === undefined || userUserOptions[defaultKey] === null) {
            userUserOptions[defaultKey] = defaultValue;
            userOptionsMissingValue = true;
          }
        });
        if (userOptionsMissingValue === true) {
          console.warn(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | userOptions | Missing Keys`, x.userOptions);
          setSyncStorage({ 'userOptions': userUserOptions })
            .then(console.warn(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | userOptions | Repaired Missing Keys`, userUserOptions))
            .catch((err) => {
              console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | ${err.name ?? 'Storage API'}: ${err.message ?? ''}\n`, err.stack ?? err);
            });
        }
      });

    getLocalStorage('playerHistory')
      .then((x) => {
        if (x.playerHistory) return;
        else setLocalStorage({ 'playerHistory': playerHistory })
          .then(() => {console.warn(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | playerHistory | Repaired undefined`)})
          .catch((err) => {
            console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | ${err.name ?? 'Storage API'}: ${err.message ?? ''}\n`, err.stack ?? err);
          });
      })

  }
});

function getLocalStorage(key){ //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - getLocalStorage Error - Error Object:`, chrome.runtime.lastError);
      let storageError = new Error(chrome.runtime.lastError.message); storageError.name = 'StorageError';
      reject(storageError);
    })
  )
}
    
function setLocalStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
    return new Promise((resolve, reject) =>
      chrome.storage.local.set(data, function() {
        if (!chrome.runtime.lastError) return resolve();
        console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - setLocalStorage Error - Error Object:`, chrome.runtime.lastError);
        let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
        reject(chromeError);
      })
    )
}

function getSyncStorage(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - getSyncStorage Error - Error Object:`, chrome.runtime.lastError);
      let storageError = new Error(chrome.runtime.lastError.message); storageError.name = 'StorageError';
      reject(storageError);
    })
  )
}
  
function setSyncStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
    return new Promise((resolve, reject) =>
      chrome.storage.sync.set(data, function() {
        if (!chrome.runtime.lastError) return resolve();
        console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - syncStorageBytes Error - Error Object:`, chrome.runtime.lastError);
        let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
        reject(chromeError);
      })
    )
}


