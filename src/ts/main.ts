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

    const loading = document.getElementById('loading') as HTMLDivElement;
    const player = document.getElementById('player') as HTMLInputElement;
    const search = document.getElementById('search') as HTMLButtonElement;
    const clear = document.getElementById('clear') as HTMLButtonElement;
    const output = document.getElementById('output') as HTMLSpanElement;

    player.placeholder = runtime.i18n.getMessage('mainInputPlaceholder');

    const settings = await runtime.storage.sync.get(null) as {
        apiKey: string,
        firstLogin: boolean,
        gameStats: boolean,
        hypixelAPI: boolean,
        lastLogout: boolean,
        relativeTimestamps: boolean,
        sentences: boolean,
        thirdPerson: boolean,
    };

    const {
        lastSearchCleared,
        lastSearches,
    } = await runtime.storage.local.get([
        'lastSearchCleared',
        'lastSearches',
    ]);

    if (
        lastSearchCleared === false &&
        lastSearches[0] &&
        lastSearches[0]?.apiData
    ) {
        output.innerHTML = pointMessage(lastSearches[0].apiData, settings);
    }

    player.addEventListener('input', () => {
        search.disabled = player.validity.valid === false;
    });

    search.addEventListener('click', async () => {
        const playerValue = player.value;

        let apiData;

        let uuid;

        player.value = '';
        search.disabled = true;
        output.textContent = '';
        loading.classList.remove('hidden');

        if (settings.hypixelAPI === true && settings.apiKey === '') {
            output.textContent = 'you dont have a key';
            return;
        }

        try {
            uuid = playerValue.match(uuidRegex)
                ? playerValue
                : await getUUID(playerValue);


            apiData = settings.hypixelAPI === true
                ? await getHypixel(uuid, settings.apiKey)
                : await getSlothpixel(uuid);

            const message = pointMessage(apiData, settings);

            output.innerHTML = message;
        } catch (error) {
            if (error instanceof NotFoundError) {
                output.innerHTML = runtime.i18n.getMessage(
                    'mainOutputErrorNotFound',
                    playerValue,
                );
            } else if (
                error instanceof HTTPError &&
                settings.hypixelAPI === false
            ) {
                output.innerHTML = runtime.i18n.getMessage(
                    'mainOutputErrorSlothpixel',
                    playerValue,
                );
            } else if (
                error instanceof HTTPError &&
                error.status === 403 &&
                settings.hypixelAPI === true
            ) {
                output.innerHTML = runtime.i18n.getMessage(
                    'mainOutputErrorHypixelInvalidKey',
                );
            } else if (error instanceof HTTPError) {
                output.innerHTML = runtime.i18n.getMessage(
                    'mainOutputErrorHypixel',
                    String(error.status),
                );
            } else {
                output.innerHTML = runtime.i18n.getMessage(
                    'mainOutputErrorGeneric',
                    (error as Error)?.stack ?? JSON.stringify(
                        error,
                        Object.getOwnPropertyNames(error),
                        4,
                    ),
                );
            }
        } finally {
            const historyEntry = {
                input: playerValue,
                uuid: uuid ?? null,
                username: apiData?.username ?? null,
                apiData: apiData ?? null,
                epoch: Date.now(),
            };

            const {
                lastSearches: newHistory,
            } = await runtime.storage.local.get('lastSearches');

            const bytes = new TextEncoder()
                .encode(Object.entries(newHistory)
                .map(([subKey, subvalue]) => subKey + JSON.stringify(subvalue))
                .join(''))
                .length;

                newHistory.unshift(historyEntry);

            if (bytes > 5000000) {
                newHistory.pop();
            }

            await runtime.storage.local.set({
                lastSearchCleared: false,
                lastSearches: newHistory,
            });
        }
    });

    clear.addEventListener('click', async () => {
        player.value = '';
        search.disabled = true;
        output.textContent = '';
        loading.classList.add('hidden');

        await runtime.storage.local.set({
            lastSearchCleared: true,
        });
    });
})();