import { cleanLength, cleanTime, createOffset, runtime, timeAgo, } from '../utility/utility.js';
import { replaceNull } from '../utility/i18n.js';
export function sentenceMessage({ username, uuid, firstLoginMS, language, lastLoginMS, lastLogoutMS, limitedAPI, isOnline, possessive, recentGames, recentGamesPlayed, version, offline: { playtime, lastGame, }, online: { gameType, mode, map, }, bedwars, duels, blitz, pit, skywars, speedUHC, uhc, walls, megaWalls, }, settings) {
    const [recentGame = {}] = recentGames;
    const getMessage = runtime.i18n.getMessage;
    const block1 = [
        getMessage('mainOutputSentenceGeneralUsername', username ?? ''),
        getMessage('mainOutputSentenceGeneralUUID', replaceNull(uuid)),
        getMessage('mainOutputSentenceGeneralStatus', isOnline
            ? getMessage('mainOutputSentenceGeneralStatusOnline')
            : getMessage('mainOutputSentenceGeneralStatusOffline')),
        getMessage('mainOutputSentenceGeneralLimitedAPI', limitedAPI
            ? getMessage('yes')
            : getMessage('no')),
    ];
    const block2 = [];
    const block3 = [];
    if (lastLoginMS || lastLogoutMS) {
        block1.push(getMessage('mainOutputSentenceGeneralUTCOffset', createOffset()));
    }
    if (settings.firstLogin) {
        block2.push(getMessage('mainOutputSentenceGeneralFirstLogin', [replaceNull(cleanTime(firstLoginMS)), replaceNull(cleanDateRelative(firstLoginMS, settings.firstLogin))]));
    }
    if (isOnline) {
        block2.push(getMessage('mainOutputSentenceOnlineSettings', [language, replaceNull(version)]));
        block3.push(`${getMessage('mainOutputSentenceOnlineLastSession', [replaceNull(cleanTime(lastLoginMS)), replaceNull(cleanDateRelative(lastLoginMS, settings.relativeTimestamps))])} ${getMessage('mainOutputSentenceOnlineGamesCount', String(recentGamesPlayed))} ${getMessage('mainOutputSentenceOnlineGamesGame', [replaceNull(gameType), replaceNull(mode), replaceNull(map)])}`);
    }
    else {
        block2.push(getMessage('mainOutputSentenceOfflineSettings', [language, replaceNull(version)]));
        let gameData = `${getMessage('mainOutputSentenceOfflineLastSession', [replaceNull(cleanTime(lastLoginMS)), replaceNull(cleanDateRelative(lastLoginMS, settings.relativeTimestamps)), replaceNull(cleanLength(lastLoginMS))])}`;
        if (recentGames.length > 0) {
            gameData += ` ${getMessage('mainOutputSentenceOfflineGamesCount', String(recentGamesPlayed))} ${getMessage('mainOutputSentenceOfflineGamesGame', [replaceNull(recentGame.gameType), replaceNull(recentGame.mode), replaceNull(recentGame.map)])}`;
        }
        else {
            gameData += ` ${getMessage('mainOutputSentenceOfflineLastGame', [replaceNull(lastGame)])}`;
        }
        block3.push(gameData);
    }
    const messages = [
        block1.join('<br>'),
        block2.join(' '),
        block3.join(' '),
    ].map(block => block
        .replace(/Your/gmi, possessive)
        .replace(/You/gmi, username ?? '')).join('<br><br>');
    return messages;
}
function cleanDateRelative(ms, relative) {
    const date = new Date(Number(ms));
    if (!ms || ms < 0 || Object.prototype.toString.call(date) !== '[object Date]')
        return null;
    return `<strong>${new Date(ms).toLocaleString(undefined, {
        dateStyle: 'medium',
    })}</strong>${relative ? ` (<strong>${cleanLength(timeAgo(ms))}</strong>)` : ''}`;
}
