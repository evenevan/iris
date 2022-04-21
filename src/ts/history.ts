import {
    i18n,
    replaceNull,
} from './utility/i18n.js';
import {
    cleanDate,
    cleanTime,
    runtime,
} from './utility/utility.js';

(async () => {
    i18n([
        'historyNoHistoryText',
    ]);

    const {
        lastSearches,
    } = await runtime.storage.local.get([
        'lastSearchCleared',
        'lastSearches',
    ]);

    const output = document.getElementById('output') as HTMLSpanElement;
    const loading = document.getElementById('loading') as HTMLDivElement;
    const noHistory = document.getElementById('noHistory') as HTMLDivElement;

    const timeout = (number: number) => new Promise(resolve => {
        setTimeout(resolve, number);
    });

    if (lastSearches.length === 0) {
        await timeout(500);
        loading.classList.add('hidden');
        noHistory.classList.remove('hidden');
        return;
    }

    const playerArray = [];

    const input = runtime.i18n.getMessage('historyOutputInput');
    const username = runtime.i18n.getMessage('historyOutputUsername');
    const uuid = runtime.i18n.getMessage('historyOutputUUID');

    for (let i = 0; i < lastSearches.length ?? 0; i += 1) {
        const searchEpoch = Number(lastSearches[i].epoch);
        const searchTime = cleanTime(searchEpoch);
        const searchDate = cleanDate(searchEpoch);

        playerArray.push(`
            <div id="output" class="flex flex-col font-normal gap-2 peer">
                <div class="flex flex-col bg-neutral-300 dark:bg-neutral-800 rounded-sm gap-2 p-2">
                    <div class="flex w-full h-fit justify-between">
                        <span class="font-semibold text-sm">${i + 1}</span>
                        <span class="font-semibold text-sm">${searchTime}, ${searchDate}</span>
                    </div>
                    <span class="break-words text-xs">
                        <b>${input}:</b> ${replaceNull(lastSearches[i]?.input)}<br>
                        <b>${username}:</b> ${replaceNull(lastSearches[i]?.username)}<br>
                        <b>${uuid}:</b> ${replaceNull(lastSearches[i]?.uuid)}<br>
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