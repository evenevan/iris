chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") { //On first install

        let userOptions = {
            typewriterOutput: true,
            persistentLastPlayer: true,
            paragraphOutput: false,
            authorNameOutput: false,
            gameStats: true,
            useHypixelAPI: false,
            apiKey: ''
        }

        let playerHistory = {
            lastSearchCleared: false,
            lastSearches: []
        }

        chrome.storage.sync.set({'userOptions': userOptions}, function() {
            console.log(new Date().toLocaleTimeString('en-IN', { hour12: true }), 'Loaded options on install ', userOptions);
        });

        chrome.storage.local.set({'playerHistory': playerHistory}, function() { //Will store the last 5 players
            console.log(new Date().toLocaleTimeString('en-IN', { hour12: true }), 'Loaded playerHistory on install ', playerHistory);
        });

    } else if (details.reason == "update") {
        //On update
    }
});