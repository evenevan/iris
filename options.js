chrome.storage.sync.get('userOptions', function(userOptions) {
    document.getElementById('gameStats').checked = userOptions.userOptions.gameStats ?? true;
    document.getElementById('typewriterOutput').checked = userOptions.userOptions.typewriterOutput ?? false;
    document.getElementById('paragraphOutput').checked = userOptions.userOptions.paragraphOutput ?? false;
    document.getElementById('useHypixelAPI').checked = userOptions.userOptions.useHypixelAPI ?? false;
    document.getElementById('apiKey').value = userOptions.userOptions.apiKey ?? '';
});

const form = document.getElementById('saveOptions');
form.addEventListener('submit', updateOptions);

async function updateOptions(event) {
    event.preventDefault();

    let userOptions = {
        paragraphOutput: document.getElementById('paragraphOutput').checked,
        typewriterOutput: document.getElementById('typewriterOutput').checked,
        gameStats: document.getElementById('gameStats').checked,
        useHypixelAPI: document.getElementById('useHypixelAPI').checked,
        apiKey: document.getElementById('apiKey').value
    }

    chrome.storage.sync.set({'userOptions': userOptions}, function() {
        console.log(new Date().toLocaleTimeString('en-IN', { hour12: true }), 'Options saved as ', userOptions);
    });
    
    let saveConfirmation = document.getElementById('saveConfirmation');
    saveConfirmation.textContent = `Saved your set options at ${new Date().toLocaleTimeString('en-IN', { hour12: true })}`
}