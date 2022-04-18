import { i18n } from "./i18n.js";
(async () => {
    const runtime = chrome ?? browser;
    i18n(runtime, [
        'mainInputSearch',
        'mainInputClear',
    ]);
    const player = document.getElementById('player');
    player.placeholder = runtime.i18n.getMessage('mainInputPlaceholder');
})();
