import { i18n, replaceNull } from './utility/i18n.js';
import { cleanDate, cleanLength, cleanTime, runtime, timeAgo, } from './utility/utility.js';
(async () => {
    i18n([]);
    const { lastSearches, } = await runtime.storage.local.get([
        'lastSearchCleared',
        'lastSearches',
    ]);
    const output = document.getElementById('output');
    const playerArray = [];
    for (let i = 0; i < lastSearches.length ?? 0; i += 1) {
        let tempString = '';
        const searchEpoch = Number(lastSearches[i].epoch);
        const searchTime = cleanTime(searchEpoch);
        const searchDate = cleanDate(searchEpoch);
        tempString += `<b>${i + 1} - ${searchTime}, ${searchDate} - ${cleanLength(timeAgo(searchEpoch))} ago</b><br>
        &nbsp;&nbsp;<b>Input:</b> ${replaceNull(lastSearches[i]?.input)}<br>
        &nbsp;&nbsp;<b>Username:</b> ${replaceNull(lastSearches[i]?.username)}<br>
        &nbsp;&nbsp;<b>UUID:</b> ${replaceNull(lastSearches[i]?.uuid)}<br>`;
        playerArray.push(`<div class="w-full h-fit bg-neutral-300 dark:bg-neutral-800 rounded-sm break-words p-2">${tempString}</div>`);
    }
    if (playerArray.length === 0) {
        output.innerHTML = 'No recent searches!';
        return;
    }
    output.innerHTML = playerArray.join('');
})();
