chrome.storage.sync.get('userOptions', function(userOptions) {
    document.getElementById('typewriterOutput').checked = userOptions.userOptions.typewriterOutput ?? false;
    document.getElementById('paragraphOutput').checked = userOptions.userOptions.paragraphOutput ?? false;
    document.getElementById('authorNameOutput').checked = userOptions.userOptions.authorNameOutput ?? false;
    document.getElementById('gameStats').checked = userOptions.userOptions.gameStats ?? true;
    document.getElementById('useHypixelAPI').checked = userOptions.userOptions.useHypixelAPI ?? false;
    document.getElementById('apiKey').value = userOptions.userOptions.apiKey ?? '';

    if ((userOptions.userOptions.paragraphOutput ?? false) === false) document.getElementById('authorNameOutputContainer').style.display = 'none';
});

document.getElementById('paragraphOutput').addEventListener('change', function() { //Hides or shows the authorNameOutput option based on paragraphOutput
    if (this.checked) document.getElementById('authorNameOutputContainer').style.display = 'block';
    else document.getElementById('authorNameOutputContainer').style.display = 'none';
});

document.getElementById('saveOptions').addEventListener('submit', updateOptions);

async function updateOptions(event) {
    event.preventDefault();

    let userOptions = {
        typewriterOutput: document.getElementById('typewriterOutput').checked,
        paragraphOutput: document.getElementById('paragraphOutput').checked,
        authorNameOutput: document.getElementById('authorNameOutput').checked,
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