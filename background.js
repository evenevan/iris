chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") { //On first install

        let userData = {
            options: {
                paragraphOutput: false,
                authorNameOutput: false,
                typewriterOutput: false,
                gameStats: true,
                useHypixelAPI: false,
                apiKey: ''
            },
            lastPlayer: null
        }

        chrome.storage.sync.set({'userData': userData}, function() { //sync storage isn't ideal for storing a search history
            console.log(new Date().toLocaleTimeString('en-IN', { hour12: true }), 'Loaded options on install ', userData);
        });

    } else if (details.reason == "update") {
        //On update
    }
});