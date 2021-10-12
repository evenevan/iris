/*eslint-disable max-lines-per-function */
/*eslint-disable max-statements */
//Yoinked from https://stackoverflow.com/a/57888548 under CC BY-SA 4.0
function fetchTimeout(url, { signal, ...fetchOptions }) {
  const controller = new AbortController(),
  promise = fetch(url, { "signal": controller.signal, ...fetchOptions }),
  timeout = setTimeout(() => controller.abort(), fetchOptions?.timeout ?? 2500);
  signal?.addEventListener("abort", () => controller.abort());
  return promise.finally(() => clearTimeout(timeout));
}

//Handles HTTP requests and deals with errors
export function createHTTPRequest(url, { ...fetchOptions }, timesAborted = 0) {
  const controller = new AbortController();
  return fetchTimeout(url, {
      "signal": controller.signal,
      ...fetchOptions
  })
  .then(async response => {
    console.trace()
    if (!response.ok) {
      const HTTPError = new Error(`HTTP status ${response.status}`),
      responseJson = await response.json().catch(err => {
        console.error(`${new Date().toLocaleTimeString("en-IN", { "hour12": true })} | JSON Parsing Error: ${err.message ?? ""}\n`, err.stack);
      });

      HTTPError.name = "HTTPError";
      HTTPError.method = fetchOptions?.method ?? "GET";
      HTTPError.status = response.status;
      HTTPError.url = url;
      HTTPError.json = responseJson ?? null;
      throw HTTPError;
    }
    return response.json();
  })
  .catch(err => {
    //Simple way to try again without an infinite loop
    if (err.name === "AbortError" && timesAborted < (fetchOptions.maxAborts ?? 1)) return createHTTPRequest(url, { ...fetchOptions }, timesAborted + 1);
    throw err;
  });
}

export function errorHandler(event, output, errorType = "Caught") {
  try {
    const err = event.error ?? event.reason ?? event,
          time = new Date().toLocaleTimeString("en-IN", { "hour12": true }),
          //eslint-disable-next-line prefer-named-capture-group
          uuidv4 = /^[0-9a-f]{8}(-?)[0-9a-f]{4}(-?)[1-5][0-9a-f]{3}(-?)[89AB][0-9a-f]{3}(-?)[0-9a-f]{12}$/;
    switch (err.name) {
      case "NotFoundError": {
        console.warn(`${time} | ${errorType} | ${err.stack}\nmethod: ${err.method}\ncode: ${err.status}\npath: ${err.url}`);
        if (!output) break;
        const temp = document.createElement("a");
        temp.setAttribute("href", `https://namemc.com/search?q=${err.input}`);
        temp.setAttribute("title", "Opens a new tab to NameMC with your search query");
        temp.setAttribute("target", "_blank");
        temp.textContent = "NameMC";
        output.textContent = "";
        output.append(`The ${uuidv4.test(err.input) ? "UUID" : "player"} "${err.input}" doesn't seem to be a valid player and wasn't found. `, temp);
      break;
      }
      case "HTTPError": {
        console.warn(`${time} | ${errorType} | ${err.stack}\nmethod: ${err.method}\ncode: ${err.status}\npath: ${err.url}`);
        if (!output) break;
        if (err.status === 500 && err.api === "Slothpixel") {
          const temp = document.createElement("a");
          temp.setAttribute("href", `https://namemc.com/search?q=${err.input}`);
          temp.setAttribute("title", "Opens a new tab to NameMC with your search query");
          temp.setAttribute("target", "_blank");
          temp.textContent = "NameMC";
          output.textContent = "";
          output.append(`Slothpixel returned an error, however this happens regularly. The ${uuidv4.test(err.input) ? "UUID" : "player"} "${err.input}" may be invalid. `, temp);
        } else if (err.status === 403 && err.api === "Hypixel") {
          const temp = document.createElement("b");
          temp.textContent = "/api";
          output.textContent = "";
          output.append("Invalid API key! Please either switch to the Slothpixel API or get a new API key with ", temp, " on Hypixel.");
        } else output.textContent = `An unexpected HTTP code of ${err.status} was returned. Try switching to the Slothpixel API if this persists.`;
      break;
      }
      case "AbortError": {
        console.warn(`${time} | ${errorType} | ${err.stack}\nmethod: ${err.method}\ncode: ${err.status}\npath: ${err.url}`);
        if (!output) break;
        output.textContent = `The ${err.api} API failed to respond. Try switching to the ${err.api === "Hypixel" ? "Slothpixel" : "Hypixel"} API if this persists.`;
      break;
      }
      case "KeyError": {
        console.warn(`${time} | ${errorType} | ${err.stack}`);
        if (!output) break;
        const temp = document.createElement("b");
        temp.textContent = "/api";
        output.textContent = "";
        output.append("You don't have an API key to use the Hypixel API! Either switch to the Slothpixel API in the options or use ", temp, " new on Hypixel and enter the key!");
      break;
      }
      case "StorageError": {
        console.error(`${time} | ${errorType} | ${err.stack}`);
      break;
      }
      default: {
        output.textContent = `Oops! ${err.name}: ${err.message}`;
        console.error(`${time} | ${errorType} | ${err.stack}`);
      break;
      }
    }
  } catch (err) {
    console.error(new Date().toLocaleTimeString("en-IN", { "hour12": true }), " | ", errorType, " |", err.stack);
  }
}

/*global chrome*/

//Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit

export function getLocalStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, result => {
      if (!chrome.runtime.lastError) return resolve(result[key]);
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = "StorageError";
      return reject(storageError);
    });
  });
}

export function setLocalStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (!chrome.runtime.lastError) return resolve();
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = "StorageError";
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
        .join(""))
        .length;
      if (!chrome.runtime.lastError) return resolve(bytes);
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = "StorageError";
      return reject(storageError);
     });
  });
}

export function getSyncStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, result => {
      if (!chrome.runtime.lastError) return resolve(result[key]);
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = "StorageError";
      return reject(storageError);
    });
  });
}

export function setSyncStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () => {
      if (!chrome.runtime.lastError) return resolve();
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = "StorageError";
      return reject(storageError);
    });
  });
}

export function syncStorageBytes(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.getBytesInUse(key, result => {
      if (!chrome.runtime.lastError) return resolve(result);
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = "StorageError";
      return reject(storageError);
     });
  });
}
