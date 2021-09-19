let userOptions;
chrome.storage.sync.get('userOptions', function(chromeStorage) {
    if ((chromeStorage.userOptions.paragraphOutput ?? false) === false) document.getElementById('authorNameOutputContainer').style.display = 'none';

    document.getElementById('typewriterOutput').checked = chromeStorage.userOptions.typewriterOutput ?? false;
    document.getElementById('paragraphOutput').checked = chromeStorage.userOptions.paragraphOutput ?? false;
    document.getElementById('authorNameOutput').checked = chromeStorage.userOptions.authorNameOutput ?? false;
    document.getElementById('gameStats').checked = chromeStorage.userOptions.gameStats ?? true;
    document.getElementById('useHypixelAPI').checked = chromeStorage.userOptions.useHypixelAPI ?? false;
    document.getElementById('apiKey').value = chromeStorage.userOptions.apiKey ?? '';

    userOptions = chromeStorage.userOptions;
});

document.querySelectorAll("input[type=checkbox]").forEach(function(checkbox) {
    checkbox.addEventListener('change', async function() {
        if (this.id === 'paragraphOutput') this.checked === true ? 
        document.getElementById('authorNameOutputContainer').style.display = 'block' : 
        document.getElementById('authorNameOutputContainer').style.display = 'none';
        userOptions[this.id] = this.checked;
        await chrome.storage.sync.set({'userOptions': userOptions});
    })
});

let apiKeyInput = document.getElementById('apiKey');
apiKeyInput.addEventListener('input', async function() {
    let regex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[45][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/g
    if (regex.test(apiKeyInput.value) || apiKeyInput.value === '') {
        document.getElementById('apiKeyError').innerHTML = '';
        userOptions.apiKey = apiKeyInput.value;
        await chrome.storage.sync.set({'userOptions': userOptions});
    } else {
        document.getElementById('apiKeyError').innerHTML = '&#9888; Invalid API key! Hypixel API keys follow the UUID v4 format. Get one with <b>/api</b> on Hypixel &#9888;';
    }
});