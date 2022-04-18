(() => {
    const userHistory = {
        lastSearchCleared: false,
        lastSearches: [],
    };

    const userSettings = {
        apiKey: '',
        firstLogin: true, //Show First Login
        gameStats: true, //Show Game Stats
        hypixelAPI: false, //Use Hypixel API
        lastLogout: false, //Show Last Logout
        relativeTimestamps: true, //Show Relative Timestamps
        sentences: false, //Use Sentences
        thirdPerson: false, //Use Third Person
    };

    const runtime = chrome ?? browser;

    //Install/Update Handling
    runtime.runtime.onInstalled.addListener(async details => {
        if (
            details.reason === runtime.runtime.OnInstalledReason.INSTALL ||
            details.reason === runtime.runtime.OnInstalledReason.UPDATE
        ) {
            const local = await runtime.storage.local.get(null) ?? {};
            const sync = await runtime.storage.sync.get(null) ?? {};

            let newLocal = {
                ...userHistory,
                ...('playerHistory' in local ? local['playerHistory'] : local),
            };

            const flatSync = 'userOptions' in sync ? sync['userOptions'] : sync;

            const newSync = {
                ...userSettings,
                thirdPerson: flatSync['authorNameOutput'] ?? userSettings['thirdPerson'], //Legacy Key Handling
                sentences: flatSync['paragraphOutput'] ?? userSettings['sentences'],
                hypixelAPI: flatSync['useHypixelAPI'] ?? userSettings['hypixelAPI'],
                ...flatSync,
            };

            await runtime.storage.local.set(newLocal);
            await runtime.storage.sync.set(newSync);

            console.log('Set settings', newLocal, newSync);
        }
    });
})();