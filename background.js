/*global chrome*/

let userOptions = {
  typewriterOutput: true,
  persistentLastPlayer: true,
  paragraphOutput: false,
  authorNameOutput: false,
  gameStats: true,
  useHypixelAPI: false,
  apiKey: ''
}

let playerHistory = {
  lastSearchCleared: false,
  lastSearches: []
}

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == "install") { //On first install
  
    setSyncStorage({ 'userOptions': userOptions })
      .then(() => {
        console.log(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Set userOptions on install`);
      })
      .catch((err) => {
        console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | ${err.name ?? 'Storage API'}: ${err.message ?? ''}\n`, err.stack ?? err);
      });
  
    setLocalStorage({ 'playerHistory': playerHistory })
      .then(() => {
        console.log(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Set playerHistory on install`);
      })
      .catch((err) => {
        console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | ${err.name ?? 'Storage API'}: ${err.message ?? ''}\n`, err.stack ?? err);
      })
  
  } else if (details.reason == "update") {

    getSyncStorage('userOptions')
      .then((x) => {
        if (x.userOptions) return;
        else setSyncStorage({ 'userOptions': userOptions })
          .then(() => {
            console.log(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | userOptions was undefined; Set userOptions on update!`);
          })
          .catch((err) => {
            console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | ${err.name ?? 'Storage API'}: ${err.message ?? ''}\n`, err.stack ?? err);
          });
      })

    getLocalStorage('playerHistory')
      .then((x) => {
        if (x.playerHistory) return;
        else setLocalStorage({ 'playerHistory': playerHistory })
          .then(() => {
            console.log(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | playerHistory was undefined; Set playerHistory on update!`);
          })
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


