(async () => {
  let { userOptions } = await getSyncStorage('userOptions');
    
  if ((userOptions.paragraphOutput ?? false) === false) document.getElementById('authorNameOutputContainer').style.display = 'none';
  document.getElementById('typewriterOutput').checked = userOptions.typewriterOutput ?? true;
  document.getElementById('persistentLastPlayer').checked = userOptions.persistentLastPlayer ?? true;
  document.getElementById('paragraphOutput').checked = userOptions.paragraphOutput ?? false;
  document.getElementById('authorNameOutput').checked = userOptions.authorNameOutput ?? false;
  document.getElementById('gameStats').checked = userOptions.gameStats ?? true;
  document.getElementById('useHypixelAPI').checked = userOptions.useHypixelAPI ?? false;
  document.getElementById('apiKey').value = userOptions.apiKey ?? '';

  document.querySelectorAll("input[type=checkbox]").forEach(function(checkbox) {
    checkbox.addEventListener('change', async function() {
      if (this.id === 'paragraphOutput') this.checked === true ? 
      document.getElementById('authorNameOutputContainer').style.display = 'block' : 
      document.getElementById('authorNameOutputContainer').style.display = 'none';
      userOptions[this.id] = this.checked;
      await setSyncStorage({'userOptions': userOptions});
    })
  });

  let apiKeyInput = document.getElementById('apiKey');
  apiKeyInput.addEventListener('input', async function() {
    let regex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[45][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/g
    if (regex.test(apiKeyInput.value) || apiKeyInput.value === '') {
      document.getElementById('apiKeyError').innerHTML = '';
      userOptions.apiKey = apiKeyInput.value;
      await setSyncStorage({'userOptions': userOptions});
    } else {
      document.getElementById('apiKeyError').innerHTML = '&#9888; Invalid API key! Hypixel API keys follow the UUID v4 format. Get one with <b>/api</b> on Hypixel &#9888;';
    }
  });
})();

function getSyncStorage(key) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, function(result) {
      if (!chrome.runtime.lastError) return resolve(result);
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}
  
function setSyncStorage(data) { //Yoinked from https://stackoverflow.com/questions/14531102/saving-and-retrieving-from-chrome-storage-sync, modified a bit
  return new Promise((resolve, reject) =>
    chrome.storage.sync.set(data, function() {
      if (!chrome.runtime.lastError) return resolve();
      console.error(new Date().toLocaleTimeString('en-IN', { hour12: true }), chrome.runtime.lastError);
      reject(Error(chrome.runtime.lastError));
    })
  )
}