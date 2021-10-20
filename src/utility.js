/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
//Taken from https://stackoverflow.com/a/57888548 under CC BY-SA 4.0
function fetchTimeout(url, { ...fetchOptions }) {
  const controller = new AbortController();
  const promise = fetch(url, {
    signal: controller.signal,
    ...fetchOptions,
  });
  const timeout = setTimeout(() => controller.abort(), 250);
  return promise.finally(clearTimeout(timeout));
}

//Handles HTTP requests and deals with errors
export function createHTTPRequest(url, { ...fetchOptions }, timesAborted = 0) {
  return fetchTimeout(url, {
      ...fetchOptions,
  })
  .then(async response => {
    if (!response.ok) {
      const HTTPError = new Error(`HTTP status ${response.status}`),
      responseJson = await response.json().catch(err => {
        console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | ${err.stack}`);
      });
      HTTPError.name = 'HTTPError';
      HTTPError.status = response.status;
      HTTPError.json = responseJson ?? null;
      throw HTTPError;
    }
    return response.json();
  })
  .catch(err => {
    if (err.name === 'AbortError' && timesAborted < (fetchOptions.maxAborts ?? 1)) return createHTTPRequest(url, { ...fetchOptions }, timesAborted + 1);
    //Aborting throws a read-only error
    const newError = new Error(err.message);
      newError.name = err.name;
      newError.method = fetchOptions?.method ?? 'GET';
      newError.url = url ?? null;
      newError.status = err.status ?? null;
      newError.json = err.json ?? null;
    throw newError;
  });
}

export function errorHandler(event, output, errorType = 'Caught') {
  try {
    const err = event.error ?? event.reason ?? event,
          time = new Date().toLocaleTimeString('en-IN', { hour12: true }),
          uuidv4 = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/;
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
        } else {
          output.textContent = `An unexpected HTTP code of ${err.status} was returned. Try switching to the Slothpixel API if this persists.`;
        }
      break;
      }
      case 'AbortError': {
        console.warn(`${time} | ${errorType} | ${err.stack}\nmethod: ${err.method}\npath: ${err.url}`);
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
        output.append(
        'You don\'t have an API key to use the Hypixel API! Either switch to the Slothpixel API in the options or use ',
        temp,
        ' new on Hypixel and enter the key!',
        );
      break;
      }
      case 'StorageError': {
        console.error(`${time} | ${errorType} | ${err.stack}`);
      break;
      }
      default: {
        output.textContent = `Oops! An error occured. ${err.name}: ${err.message}`;
        console.error(`${time} | ${errorType} | ${err.stack}`);
      break;
      }
    }
  } catch (err) {
    console.error(`${new Date().toLocaleTimeString('en-IN', { hour12: true })} | HandlerError | ${err.stack}`);
  }
}

export function errorEventCreate(window, output) {
  window.addEventListener('error', error => errorHandler(error, output, error.constructor.name));
  window.addEventListener('unhandledrejection', error => errorHandler(error, output, error.constructor.name));
  window.onerror = () => true;
}

export function cleanDate(ms) {
  const newDate = new Date(ms);
  if (!ms || ms < 0 || Object.prototype.toString.call(newDate) !== '[object Date]') return null;
  const day = newDate.getDate(),
  month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(newDate),
  year = newDate.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function cleanTime(ms) {
  const newDate = new Date(ms);
  if (!ms || ms < 0 || Object.prototype.toString.call(newDate) !== '[object Date]') return null;
  return newDate.toLocaleTimeString('en-IN', { hour12: true });
}

export function timeAgo(ms) {
  if (ms < 0 || ms === null || isNaN(ms)) return null;
  return Date.now() - ms;
}

export function cleanLength(ms) {
  if (ms < 0 || ms === null || isNaN(ms)) return null;
  let seconds = Math.round(ms / 1000);
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return days > 0
    ? `${days}d ${hours}h ${minutes}m ${seconds}s`
    : hours > 0
    ? `${hours}h ${minutes}m ${seconds}s`
    : minutes > 0
    ? `${minutes}m ${seconds}s`
    : `${seconds}s`;
}

//Taken from https://stackoverflow.com/a/13016136 under CC BY-SA 3.0 matching ISO 8601
export function createOffset(date = new Date()) {
  function pad(value) {
    return value < 10 ? `0${value}` : value;
  }

  const sign = date.getTimezoneOffset() > 0 ? '-' : '+',
  offset = Math.abs(date.getTimezoneOffset()),
  hours = pad(Math.floor(offset / 60)),
  minutes = pad(offset % 60);
  return `${sign + hours}:${minutes}`;
}

export function createRatio(first = 0, second = 0) {
  if (first === 0 || second === 0) return 0;
  return maxDecimals(first / second);
}

export function maxDecimals(value, decimals = 2) {
  const decimalValue = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * decimalValue) / decimalValue;
}

//Taken from https://github.com/slothpixel/core/blob/master/util/calculateUhcLevel.js under the MIT License
export function uhcScoreToLevel(xp) {
  const scores = [0, 10, 60, 210, 460, 960, 1710, 2710, 5210, 10210, 13210, 16210, 19210, 22210, 25210];
  let level = 0;
  for (const score of scores) {
    if (xp >= score) level += 1;
    else break;
  }
  return level;
}

/*global chrome*/

//Taken from hhttps://stackoverflow.com/q/14531102, modified a bit

export function getLocalStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, result => {
      if (!chrome.runtime.lastError) return resolve(result[key]);
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = 'StorageError';
      return reject(storageError);
    });
  });
}

export function setLocalStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (!chrome.runtime.lastError) return resolve();
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = 'StorageError';
      return reject(storageError);
    });
  });
}

//This is different due to https://bugzilla.mozilla.org/show_bug.cgi?id=1385832
export function localStorageBytes(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, result => {
      const bytes = new TextEncoder()
        .encode(Object.entries(result)
        .map(([subKey, subvalue]) => subKey + JSON.stringify(subvalue))
        .join(''))
        .length;
      if (!chrome.runtime.lastError) return resolve(bytes);
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = 'StorageError';
      return reject(storageError);
     });
  });
}

export function getSyncStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, result => {
      if (!chrome.runtime.lastError) return resolve(result[key]);
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = 'StorageError';
      return reject(storageError);
    });
  });
}

export function setSyncStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () => {
      if (!chrome.runtime.lastError) return resolve();
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = 'StorageError';
      return reject(storageError);
    });
  });
}

export function syncStorageBytes(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.getBytesInUse(key, result => {
      if (!chrome.runtime.lastError) return resolve(result);
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = 'StorageError';
      return reject(storageError);
     });
  });
}
