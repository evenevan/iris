import type {
    Local,
    Sync,
} from './@types/main';
import { getHypixel } from './core/getHypixel.js';
import { getSlothpixel } from './core/getSlothpixel.js';
import { getUUID } from './core/getUUID.js';
import { pointMessage } from './core/pointMessage.js';
import { sentenceMessage } from './core/sentenceMessage.js';
import { HTTPError } from './utility/HTTPError.js';
import { i18n } from './utility/i18n.js';
import { NotFoundError } from './utility/NotFoundError.js';
import {
    runtime,
    timeout,
} from './utility/utility.js';

(async () => {
    i18n([
        'search',
        'settings',
        'history',
        'about',
        'searchInputSearch',
        'searchInputClear',
    ]);

    const uuidRegex = /^[0-9a-fA-F]{8}(-?)[0-9a-fA-F]{4}(-?)[1-5][0-9a-fA-F]{3}(-?)[89ABab][0-9a-fA-F]{3}(-?)[0-9a-fA-F]{12}$/;

    const loading = document.getElementById('loading') as HTMLDivElement;
    const player = document.getElementById('player') as HTMLInputElement;
    const search = document.getElementById('searchButton') as HTMLButtonElement;
    const clear = document.getElementById('clear') as HTMLButtonElement;
    const output = document.getElementById('output') as HTMLSpanElement;

    player.placeholder = runtime.i18n.getMessage('searchInputPlaceholder');

    const settings = await runtime.storage.sync.get(null) as Sync;

    const {
        lastSearch,
        lastSearchCleared,
    } = await runtime.storage.local.get([
        'lastSearch',
        'lastSearchCleared',
    ]) as Pick<Local, 'lastSearch' | 'lastSearchCleared'>;

    if (
        lastSearchCleared === false
        && lastSearch
        && lastSearch?.apiData
    ) {
        output.innerHTML = settings.sentences === true
            ? sentenceMessage(lastSearch.apiData, settings)
            : pointMessage(lastSearch.apiData, settings);
    }

    player.addEventListener('input', () => {
        console.log('x');
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
            await timeout(250);

            output.innerHTML = runtime.i18n.getMessage(
                'searchOutputErrorHypixelNoKey',
            );

            return;
        }

        try {
            uuid = playerValue.match(uuidRegex)
                ? playerValue
                : await getUUID(playerValue);

            apiData = settings.hypixelAPI === true
                ? await getHypixel(uuid, settings.apiKey)
                : await getSlothpixel(uuid);

            const message = settings.sentences === true
                ? sentenceMessage(apiData, settings)
                : pointMessage(apiData, settings);

            output.innerHTML = message;
        } catch (error) {
            if (error instanceof NotFoundError) {
                output.innerHTML = runtime.i18n.getMessage(
                    'searchOutputErrorNotFound',
                    playerValue,
                );
            } else if (
                error instanceof HTTPError
                && settings.hypixelAPI === false
            ) {
                output.innerHTML = runtime.i18n.getMessage(
                    'searchOutputErrorSlothpixel',
                    playerValue,
                );
            } else if (
                error instanceof HTTPError
                && error.status === 403
                && settings.hypixelAPI === true
            ) {
                output.innerHTML = runtime.i18n.getMessage(
                    'searchOutputErrorHypixelInvalidKey',
                );
            } else if (error instanceof HTTPError) {
                output.innerHTML = runtime.i18n.getMessage(
                    'searchOutputErrorHypixel',
                    String(error.status),
                );
            } else {
                output.innerHTML = runtime.i18n.getMessage(
                    'searchOutputErrorGeneric',
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
                history: newHistory,
            } = await runtime.storage.local.get('history');

            const bytes = () => new TextEncoder()
                .encode(Object.entries(newHistory ?? {})
                    .map(([subKey, subvalue]) => subKey + JSON.stringify(subvalue))
                    .join(''))
                .length;

            newHistory.unshift(historyEntry);

            while (bytes() > 1_000_000) {
                newHistory.pop();
            }

            await runtime.storage.local.set({
                lastSearchCleared: false,
                lastSearch: historyEntry,
                history: newHistory,
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