/*global chrome*/
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") { //On first install

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

        setSyncStorage({ 'userOptions': userOptions })
            .then(() => {
                console.log(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Set userOptions on install`);
            })
            .catch((err) => {
                console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Storage API |`, err.stack ?? err);
            });

        setLocalStorage({ 'playerHistory': playerHistory })
            .then(() => {
                console.log(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Set playerHistory on install`);
            })
            .catch((err) => {
                console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | Storage API |`, err.stack ?? err);
            })

    } else if (details.reason == "update") {
        //On update
    }
});

    
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