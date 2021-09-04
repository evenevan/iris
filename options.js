chrome.storage.sync.get('userOptions', function(userOptions) {
    document.getElementById('gameStats').checked = userOptions.userOptions.stats ?? true;
    document.getElementById('useHypixelAPI').checked = userOptions.userOptions.useHypixelAPI ?? false;
    document.getElementById('apiKey').value = userOptions.userOptions.key ?? '';
});

const form = document.getElementById('saveOptions');
form.addEventListener('submit', updateOptions);

async function updateOptions(event) {
    event.preventDefault();

    let userOptions = new Object();
        userOptions.stats = document.getElementById('gameStats').checked;
        userOptions.useHypixelAPI = document.getElementById('useHypixelAPI').checked;
        userOptions.key = document.getElementById('apiKey').value;

    chrome.storage.sync.set({'userOptions': userOptions}, function() {
        console.log('Options saved as ' + userOptions.toString());
    });
    
    let saveConfirmation = document.getElementById('saveConfirmation');
    saveConfirmation.textContent = `Saved your set options at ${new Date().toLocaleTimeString('en-IN', { hour12: true })}`
}