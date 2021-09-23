export function getLocalStorage(key){ //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}
  
export function setLocalStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}
  
export function getSyncStorage(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}
  
export function setSyncStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
 return new Promise((resolve, reject) =>
    chrome.storage.sync.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}