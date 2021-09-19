let userData;
chrome.storage.sync.get('userData', function(chromeStorage) {
    if ((chromeStorage.userData.options.paragraphOutput ?? false) === false) document.getElementById('authorNameOutputContainer').style.display = 'none';
    console.log(chromeStorage.userData)
    document.getElementById('typewriterOutput').checked = chromeStorage.userData.options.typewriterOutput ?? false;
    document.getElementById('paragraphOutput').checked = chromeStorage.userData.options.paragraphOutput ?? false;
    document.getElementById('authorNameOutput').checked = chromeStorage.userData.options.authorNameOutput ?? false;
    document.getElementById('gameStats').checked = chromeStorage.userData.options.gameStats ?? true;
    document.getElementById('useHypixelAPI').checked = chromeStorage.userData.options.useHypixelAPI ?? false;
    document.getElementById('apiKey').value = chromeStorage.userData.options.apiKey ?? '';

    userData = chromeStorage.userData;
});

document.querySelectorAll("input[type=checkbox]").forEach(function(checkbox) {
    checkbox.addEventListener('change', async function() {
        if (this.id === 'paragraphOutput') this.checked === true ? 
        document.getElementById('authorNameOutputContainer').style.display = 'block' : 
        document.getElementById('authorNameOutputContainer').style.display = 'none';
        userData.options[this.id] = this.checked;
        await chrome.storage.sync.set({'userData': userData}); //.catch is probably not nessessary, although an error handler would be an upgrade
    })
});

let apiKeyInput = document.getElementById('apiKey');
apiKeyInput.addEventListener('input', async function() {
    let regex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[45][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/g
    if (regex.test(apiKeyInput.value) || apiKeyInput.value === '') {
        document.getElementById('apiKeyError').innerHTML = '';
        userData.options.apiKey = apiKeyInput.value;
        await chrome.storage.sync.set({'userData': userData}); //.catch is probably not nessessary, although an error handler would be an upgrade
    } else {
        document.getElementById('apiKeyError').innerHTML = '&#9888; Invalid API key! Hypixel API keys follow the UUID v4 format. Get one with <b>/api</b> on Hypixel &#9888;';
    }
});