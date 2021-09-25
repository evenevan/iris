export function getLocalStorage(key){ //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - getLocalStorage Error - Error Object:`, chrome.runtime.lastError);
      let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
      reject(chromeError);
    })
  )
}
  
export function setLocalStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - setLocalStorage Error - Error Object:`, chrome.runtime.lastError);
      let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
      reject(chromeError);
    })
  )
}

export function localStorageBytes(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
     chrome.storage.local.getBytesInUse(key, function(result) {
       if (!chrome.runtime.lastError) return resolve(result);
       console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - localStorageBytes Error - Error Object:`, chrome.runtime.lastError);
       let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
        reject(chromeError);
     })
   )
 }
  
export function getSyncStorage(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - getSyncStorage Error - Error Object:`, chrome.runtime.lastError);
      let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
      reject(chromeError);
    })
  )
}
  
export function setSyncStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
 return new Promise((resolve, reject) =>
    chrome.storage.sync.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - syncStorageBytes Error - Error Object:`, chrome.runtime.lastError);
      let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
      reject(chromeError);
    })
  )
}

export function syncStorageBytes(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
     chrome.storage.sync.getBytesInUse(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} - localStorageBytes Error - Error Object:`, chrome.runtime.lastError);
      let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
      reject(chromeError);
     })
   )
 }