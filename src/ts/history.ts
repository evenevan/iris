import type { Local } from './@types/main';
import {
    i18n,
    replaceNull,
} from './utility/i18n.js';
import {
    runtime,
    timeout,
} from './utility/utility.js';

(async () => {
    i18n([
        'main',
        'settings',
        'history',
        'about',
        'historyNoHistoryText',
    ]);

    const {
        history,
    } = await runtime.storage.local.get([
        'history',
    ]) as Pick<Local, 'history'>;

    const output = document.getElementById('output') as HTMLSpanElement;
    const loading = document.getElementById('loading') as HTMLDivElement;
    const noHistory = document.getElementById('noHistory') as HTMLDivElement;

    await timeout(500 / Math.max(history.length, 1));

    if (history.length === 0) {
        loading.classList.add('hidden');
        noHistory.classList.remove('hidden');
        return;
    }

    const playerArray = [];

    const input = runtime.i18n.getMessage('historyOutputInput');
    const username = runtime.i18n.getMessage('historyOutputUsername');
    const uuid = runtime.i18n.getMessage('historyOutputUUID');

    for (let i = 0; i < history.length ?? 0; i += 1) {
        const searchEpoch = Number(history[i].epoch);

        playerArray.push(`
            <div id="output" class="flex flex-col font-normal gap-2 peer">
                <div class="flex flex-col bg-neutral-300 dark:bg-neutral-800 rounded-sm gap-2 p-2">
                    <div class="flex w-full h-fit justify-between">
                        <span class="font-semibold text-sm">${i + 1}</span>
                        <span class="font-semibold text-sm">
                            ${new Date(searchEpoch).toLocaleString(undefined, {
                                timeStyle: 'medium',
                                dateStyle: 'medium',
                            })}
                        </span>
                    </div>
                    <span class="break-words text-xs">
                        <b>${input}:</b> ${replaceNull(history[i]?.input)}<br>
                        <b>${username}:</b> ${replaceNull(history[i]?.username)}<br>
                        <b>${uuid}:</b> ${replaceNull(history[i]?.uuid)}<br>
                    </span>
                </div>
            </div>
        `);

        //eslint-disable-next-line no-await-in-loop
        await timeout(1);
    }

    loading.classList.add('hidden');
    output.innerHTML = playerArray.join('');
})();