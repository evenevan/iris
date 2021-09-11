chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") { //On first install
        let userOptions = {
            paragraphOutput: false,
            typewriterOutput: false,
            gameStats: true,
            useHypixelAPI: false,
            apiKey: ''
        }

        chrome.storage.sync.set({'userOptions': userOptions}, function() {
            console.log(new Date().toLocaleTimeString('en-IN', { hour12: true }), 'Loaded options on install ', userOptions);
        });
    } else if (details.reason == "update") {
        //On update
    }
});