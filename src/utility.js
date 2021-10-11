const fetchTimeout = async (url, ms, { signal, ...fetchOptions } = {}) => { //Yoinked from https://stackoverflow.com/a/57888548 under CC BY-SA 4.0
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal, ...fetchOptions });
  if (signal) signal.addEventListener("abort", () => controller.abort());
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
};

export function createHTTPRequest(url, {...fetchOptions}, timeout = 2500, timesAborted = 0) { //Handles HTTP requests and deals with errors
  const controller = new AbortController();
  return fetchTimeout(url, timeout, {
      signal: controller.signal,
      ...fetchOptions
  }).then(async function(response) {
    if (!response.ok) {
      const responseJson = await response.json().catch(err => {
        console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | JSON Parsing Error: ${err.message ?? ''}\n`, err.stack);
      })
      const HTTPError = new Error(`HTTP status ${response.status}`);
      HTTPError.name = "HTTPError";
      HTTPError.method = fetchOptions?.method ?? 'GET';
      HTTPError.status = response.status;
      HTTPError.url = url;
      HTTPError.json = responseJson || null;
      throw HTTPError;
    }
    return await response.json();
  }).catch(err => {
    if (err.name === "AbortError" && timesAborted < 1) return createHTTPRequest(url, {...fetchOptions}, timeout, timesAborted + 1); //Simple way to try again without an infinite loop
    throw err;
  });
}

export function errorHandler(event, output, errorType = 'Caught') {
  try {
    const err = event.error ?? event.reason ?? event;
    const time = new Date().toLocaleTimeString('en-IN', { hour12: true });
    const uuidv4 = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/;
    switch (err.name) {
      case 'NotFoundError': {
        console.warn(`${time} | ${errorType} | ${err.stack}\nmethod: ${err.method}\ncode: ${err.status}\npath: ${err.url}`);
        if (!output) break;
        const temp = document.createElement('a');
        temp.setAttribute('href', `https://namemc.com/search?q=${err.input}`);
        temp.setAttribute('title', 'Opens a new tab to NameMC with your search query');
        temp.setAttribute('target', '_blank');
        temp.textContent = 'NameMC';
        output.textContent = '';
        output.append(`The ${uuidv4.test(err.input) ? 'UUID' : 'player'} "${err.input}" doesn't seem to be a valid player and wasn't found. `, temp);
      break;
      }
      case 'HTTPError': {
        console.warn(`${time} | ${errorType} | ${err.stack}\nmethod: ${err.method}\ncode: ${err.status}\npath: ${err.url}`);
        if (!output) break;
        if (err.status === 500 && err.api === 'Slothpixel') {
          const temp = document.createElement('a');
          temp.setAttribute('href', `https://namemc.com/search?q=${err.input}`);
          temp.setAttribute('title', 'Opens a new tab to NameMC with your search query');
          temp.setAttribute('target', '_blank');
          temp.textContent = 'NameMC';
          output.textContent = '';
          output.append(`Slothpixel returned an error, however this happens regularly. The ${uuidv4.test(err.input) ? 'UUID' : 'player'} "${err.input}" may be invalid. `, temp);
        } else if (err.status === 403 && err.api === 'Hypixel') {
          const temp = document.createElement('b');
          temp.textContent = '/api';
          output.textContent = '';
          output.append('Invalid API key! Please either switch to the Slothpixel API or get a new API key with ', temp, ' on Hypixel.');
        } else output.textContent = `An unexpected HTTP code of ${err.status} was returned. Try switching to the Slothpixel API if this persists.`;
      break;
      }
      case 'AbortError': {
        console.warn(`${time} | ${errorType} | ${err.stack}\nmethod: ${err.method}\ncode: ${err.status}\npath: ${err.url}`);
        if (!output) break;
        output.textContent = `The ${err.api} API failed to respond. Try switching to the ${err.api === 'Hypixel' ? 'Slothpixel' : 'Hypixel'} API if this persists.`;
      break;
      }
      case 'KeyError': {
        console.warn(`${time} | ${errorType} | ${err.stack}`);
        if (!output) break;
        const temp = document.createElement('b');
        temp.textContent = '/api';
        output.textContent = '';
        output.append('You don\'t have an API key to use the Hypixel API! Either switch to the Slothpixel API in the options or use ', temp, ' new on Hypixel and enter the key!');
      break;
      }
      case 'StorageError': {
        console.error(`${time} | ${errorType} | ${err.stack}`);
      break;
      }
      case 'RangeError':
      case 'ReferenceError':
      case 'TypeError': {
        console.error(`${time} | ${errorType} | ${err.stack}`);
        output.textContent = `${err.name}: ${err.message} - Please contact Attituding#6517!`;
      break;  
      }
      default: {
        console.error(`${time} | ${errorType} | ${err.stack}`);
      break;
      }
    }
  } catch (err) {
    console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), ' | ', errorType, ' |', err.stack);
  }
}

/*global chrome*/

export function getLocalStorage(key){ //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result[key]);
      const storageError = new Error(chrome.runtime.lastError.message); storageError.name = 'StorageError';
      reject(storageError);
    })
  );
}
  
export function setLocalStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.local.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      const storageError = new Error(chrome.runtime.lastError.message); storageError.name = 'StorageError';
      reject(storageError);
    })
  );
}
export function localStorageBytes(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) => //This is different due to https://bugzilla.mozilla.org/show_bug.cgi?id=1385832
     chrome.storage.local.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(new TextEncoder().encode(Object.entries(result).map(([key, value]) => key + JSON.stringify(value)).join('')).length);
      const storageError = new Error(chrome.runtime.lastError.message); storageError.name = 'StorageError';
      reject(storageError);
     })
   );
 }
  
export function getSyncStorage(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result[key]);
      const storageError = new Error(chrome.runtime.lastError.message); storageError.name = 'StorageError';
      reject(storageError);
    })
  );
}
  
export function setSyncStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
 return new Promise((resolve, reject) =>
    chrome.storage.sync.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      const storageError = new Error(chrome.runtime.lastError.message); storageError.name = 'StorageError';
      reject(storageError);
    })
  );
}

export function syncStorageBytes(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
     chrome.storage.sync.getBytesInUse(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      const storageError = new Error(chrome.runtime.lastError.message); storageError.name = 'StorageError';
      reject(storageError);
     })
   );
 }