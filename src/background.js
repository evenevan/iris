/*global chrome*/

const playerHistory = {
  lastSearchCleared: false,
  lastSearches: [],
},
userOptions = {
  apiKey: '',
  authorNameOutput: false,
  relativeTimestamps: true,
  firstLogin: true,
  gameStats: true,
  lastLogout: false,
  typewriterOutput: true,
  paragraphOutput: false,
  persistentLastPlayer: true,
  useHypixelAPI: false,
};

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') onInstall();
  else if (details.reason === 'update') onUpdate();
});

async function onInstall() {
  const time = new Date().toLocaleTimeString('en-IN', { hour12: true }),
  setStorage = await Promise.allSettled([
    setSyncStorage({ userOptions: userOptions }),
    setLocalStorage({ playerHistory: playerHistory }),
  ]);

  if (setStorage.filter(allSettled => allSettled.status === 'rejected').length > 0) console.error(`${time} | StorageError:`, setStorage);
}

function onUpdate() {
  const time = new Date().toLocaleTimeString('en-IN', { hour12: true });

  //Repairs any missing or undefined values
  getSyncStorage('userOptions')
    .then(storageGET => {
      const missingUserOptions = [];

      Object.entries(userOptions).forEach(entry => {
        const [defaultKey, defaultValue] = entry;
        //eslint-disable-next-line no-undefined
        if (storageGET[defaultKey] === undefined || storageGET[defaultKey] === null) {
          storageGET[defaultKey] = defaultValue;
          missingUserOptions.push(defaultKey);
          }
      });

      if (missingUserOptions.length > 0) {
        console.warn(`${time} | userOptions | Missing Keys`, missingUserOptions);
        setSyncStorage({ userOptions: storageGET })
          .then(console.warn(`${time} | userOptions | Repaired Missing Keys`, storageGET));
      }
    })
    .catch(err => {
      console.error(`${time} | ${err.stack}`);
    });

  getLocalStorage('playerHistory')
    .then(storageGET => {
      if (!storageGET) {
        setLocalStorage({ playerHistory: playerHistory })
        .then(() => console.warn(`${time} | playerHistory | Repaired undefined`));
      }
    })
    .catch(err => {
      console.error(`${time} | ${err.stack}`);
    });
}

//Taken from hhttps://stackoverflow.com/q/14531102, modified a bit

function getLocalStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, result => {
      if (!chrome.runtime.lastError) return resolve(result[key]);
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = 'StorageError';
      return reject(storageError);
    });
  });
}

function setLocalStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (!chrome.runtime.lastError) return resolve();
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = 'StorageError';
      return reject(storageError);
    });
  });
}

function getSyncStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, result => {
      if (!chrome.runtime.lastError) return resolve(result[key]);
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = 'StorageError';
      return reject(storageError);
    });
  });
}

function setSyncStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(data, () => {
      if (!chrome.runtime.lastError) return resolve();
      const storageError = new Error(chrome.runtime.lastError.message);
      storageError.name = 'StorageError';
      return reject(storageError);
    });
  });
}
