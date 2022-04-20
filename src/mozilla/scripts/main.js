import { getHypixel } from './core/getHypixel.js';
import { getSlothpixel } from './core/getSlothpixel.js';
import { getUUID } from './core/getUUID.js';
import { pointMessage } from './core/pointMessage.js';
import { HTTPError } from './utility/HTTPError.js';
import { i18n } from './utility/i18n.js';
import { NotFoundError } from './utility/NotFoundError.js';
import { runtime } from './utility/utility.js';
(async () => {
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
        if (settings.hypixelAPI === true && settings.apiKey === '') {
            output.textContent = 'you dont have a key';
            return;
        }
        try {
            const uuid = playerValue.match(uuidRegex)
                ? playerValue
                : await getUUID(playerValue);
            const data = settings.hypixelAPI === true
                ? await getHypixel(uuid, settings.apiKey)
                : await getSlothpixel(uuid);
            const message = pointMessage(data, settings);
            output.innerHTML = message;
        }
        catch (error) {
            if (error instanceof NotFoundError) {
                output.textContent = 'player not found!!!!!';
            }
            else if (error instanceof HTTPError &&
                settings.hypixelAPI === false) {
                output.textContent = 'try switching to hypixel api';
            }
            else if (error instanceof HTTPError) {
                output.textContent = 'oops! try again later.';
            }
            else {
                console.log(error);
                output.textContent = 'please go yell at attituding :)';
            }
        }
    });
    clear.addEventListener('click', () => {
        player.value = '';
        search.disabled = true;
        output.textContent = '';
    });
})();
