import { getHypixel } from './core/getHypixel.js';
import { getSlothpixel } from './core/getSlothpixel.js';
import { getUUID } from './core/getUUID.js';
import { i18n } from './utility/i18n.js';
(async () => {
    const runtime = chrome ?? browser;
    i18n([
        'mainInputSearch',
        'mainInputClear',
    ]);
    const uuidRegex = /^[0-9a-fA-F]{8}(-?)[0-9a-fA-F]{4}(-?)[1-5][0-9a-fA-F]{3}(-?)[89ABab][0-9a-fA-F]{3}(-?)[0-9a-fA-F]{12}$/;
    const player = document.getElementById('player');
    const search = document.getElementById('search');
    const clear = document.getElementById('clear');
    const output = document.getElementById('output');
    player.placeholder = runtime.i18n.getMessage('mainInputPlaceholder');
    const settings = await runtime.storage.sync.get(null);
    player.addEventListener('input', () => {
        search.disabled = player.validity.valid === false;
    });
    search.addEventListener('click', async () => {
        const playerValue = player.value;
        player.value = '';
        search.disabled = true;
        if (settings.hypixelAPI && settings.apiKey === '') {
            output.textContent = 'you dont have a key';
            return;
        }
        const uuid = playerValue.match(uuidRegex)
            ? playerValue
            : await getUUID(playerValue);
        const data = settings.hypixelAPI === false
            ? await getHypixel(uuid, settings.apiKey)
            : await getSlothpixel(uuid);
    });
    clear.addEventListener('click', () => {
        player.value = '';
        search.disabled = true;
        output.textContent = '';
    });
})();
