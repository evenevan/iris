const fetchTimeout = (url, ms, { signal, ...options } = {}) => { //Yoinked from https://stackoverflow.com/a/57888548 under CC BY-SA 4.0
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    if (signal) signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
};

export async function createHTTPRequest(url, timeout = 2500, timesAborted = 0) { //Is this good code? I have no idea. Certainly makes the rest cleaner.
let controller = new AbortController();
  return fetchTimeout(url, timeout, {
      signal: controller.signal
  }).then(async function(response) {
    if (!response.ok) {
      let responseJson = await response.json().catch((err) => {
        console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | JSON Parsing Error |`, err.stack);
      })
      let newError = new Error(`HTTP status ${response.status}`);
      newError.name = "HTTPError";
      newError.status = response.status;
      newError.json = responseJson || null;
      throw newError;
    }
    return response.json();
  }).catch(err => {
    if (err.name === "AbortError" && timesAborted < 1) return createRequest(uuid, apiKey, timesAborted++); //Simple way to try again without an infinite loop
    throw err;
  });
};

export function getLocalStorage(key){ //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | getLocalStorage Error |`, chrome.runtime.lastError);
      let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
      reject(chromeError);
    })
  )
}
  
export function setLocalStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | setLocalStorage Error |`, chrome.runtime.lastError);
      let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
      reject(chromeError);
    })
  )
}

export function localStorageBytes(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
     chrome.storage.local.getBytesInUse(key, function(result) {
       if (!chrome.runtime.lastError) return resolve(result);
       console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | localStorageBytes Error |`, chrome.runtime.lastError);
       let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
        reject(chromeError);
     })
   )
 }
  
export function getSyncStorage(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | getSyncStorage Error |`, chrome.runtime.lastError);
      let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
      reject(chromeError);
    })
  )
}
  
export function setSyncStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
 return new Promise((resolve, reject) =>
    chrome.storage.sync.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | syncStorageBytes Error |`, chrome.runtime.lastError);
      let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
      reject(chromeError);
    })
  )
}

export function syncStorageBytes(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
     chrome.storage.sync.getBytesInUse(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | localStorageBytes Error |`, chrome.runtime.lastError);
      let chromeError = new Error(chrome.runtime.lastError.message); chromeError.name = 'ChromeError';
      reject(chromeError);
     })
   )
 }