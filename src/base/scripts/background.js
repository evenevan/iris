"use strict";
// Defaults
const userHistory = {
    lastSearchCleared: false,
    lastSearch: null,
    history: [],
};
const userSettings = {
    apiKey: '',
    firstLogin: true,
    gameStats: true,
    hypixelAPI: false,
    lastLogout: false,
    relativeTimestamps: true,
    sentences: false,
    thirdPerson: false, // Use Third Person
};
let runtime = chrome;
try {
    runtime = browser;
    // eslint-disable-next-line no-empty
}
catch { }
// Install/Update Handling
runtime.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === runtime.runtime.OnInstalledReason.INSTALL
        || details.reason === runtime.runtime.OnInstalledReason.UPDATE) {
        const local = (await runtime.storage.local.get(null)) ?? {};
        const sync = (await runtime.storage.sync.get(null)) ?? {};
        const localIsLegacy = 'playerHistory' in local;
        const newLocal = {
            lastSearchCleared: localIsLegacy
                ? local.playerHistory.lastSearchCleared
                : local?.lastSearchCleared ?? userHistory.lastSearchCleared,
            lastSearch: localIsLegacy
                ? local.playerHistory.lastSearches[0] ?? userHistory.lastSearchCleared
                : local?.lastSearch ?? userHistory.lastSearch,
            history: localIsLegacy
                ? local.playerHistory.lastSearches
                : local?.history ?? userHistory.history,
        };
        const syncIsLegacy = 'userOptions' in sync;
        const newSync = {
            apiKey: syncIsLegacy ? sync.userOptions.apiKey : sync?.apiKey ?? userSettings.apiKey,
            firstLogin: syncIsLegacy
                ? sync.userOptions.firstLogin
                : sync?.firstLogin ?? userSettings.firstLogin,
            gameStats: syncIsLegacy
                ? sync.userOptions.gameStats
                : sync?.gameStats ?? userSettings.gameStats,
            hypixelAPI: syncIsLegacy
                ? sync.userOptions.useHypixelAPI
                : sync?.hypixelAPI ?? userSettings.hypixelAPI,
            lastLogout: syncIsLegacy
                ? sync.userOptions.lastLogout
                : sync?.lastLogout ?? userSettings.lastLogout,
            relativeTimestamps: syncIsLegacy
                ? sync.userOptions.relativeTimestamps
                : sync?.relativeTimestamps ?? userSettings.relativeTimestamps,
            sentences: syncIsLegacy
                ? sync.userOptions.paragraphOutput
                : sync?.sentences ?? userSettings.sentences,
            thirdPerson: syncIsLegacy
                ? sync.userOptions.authorNameOutput
                : sync?.thirdPerson ?? userSettings.thirdPerson,
        };
        await runtime.storage.local.clear();
        await runtime.storage.sync.clear();
        await runtime.storage.local.set(newLocal);
        await runtime.storage.sync.set(newSync);
        console.log('Set settings', newLocal, newSync);
    }
});
