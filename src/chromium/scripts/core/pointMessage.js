import { cleanLength, createOffset, newLine, runtime, timeAgo, } from '../utility/utility.js';
import { replaceNull } from '../utility/i18n.js';
const { getMessage } = runtime.i18n;
export function pointMessage({ username, uuid, firstLoginMS, language, lastLoginMS, lastLogoutMS, limitedAPI, isOnline, possessive, recentGames, recentGamesPlayed, version, offline: { playtime, lastGame }, online: { gameType, mode, map }, bedwars, duels, blitz, pit, skywars, speedUHC, uhc, walls, megaWalls, }, settings) {
    const [recentGame = {}] = recentGames;
    const lines = [
        getMessage('searchOutputPointGeneralUsername', username ?? ''),
        getMessage('searchOutputPointGeneralUUID', replaceNull(uuid)),
        getMessage('searchOutputPointGeneralStatus', isOnline
            ? getMessage('searchOutputPointGeneralStatusOnline')
            : getMessage('searchOutputPointGeneralStatusOffline')),
        getMessage('searchOutputPointGeneralLimitedAPI', limitedAPI ? getMessage('yes') : getMessage('no')),
    ];
    if (lastLoginMS || lastLogoutMS) {
        lines.push(getMessage('searchOutputPointGeneralUTCOffset', createOffset()));
    }
    lines.push(getMessage('searchOutputPointGeneralVersion', replaceNull(version)), getMessage('searchOutputPointGeneralLanguage', replaceNull(language)));
    if (settings.firstLogin) {
        lines.push(getMessage('searchOutputPointGeneralFirstLogin', replaceNull(dateTime(firstLoginMS, settings.relativeTimestamps))));
    }
    lines.push(getMessage('searchOutputPointGeneralLastLogin', replaceNull(dateTime(lastLoginMS, settings.relativeTimestamps))));
    if (settings.lastLogout) {
        lines.push(getMessage('searchOutputPointGeneralLastLogout', replaceNull(dateTime(lastLogoutMS, settings.relativeTimestamps))));
    }
    if (isOnline) {
        lines.push(getMessage('searchOutputPointOnlinePlaytime', replaceNull(cleanLength(timeAgo(lastLoginMS)))));
        if (recentGamesPlayed > 0) {
            lines.push(getMessage('searchOutputPointOnlineGamesPlayed', String(recentGamesPlayed)));
        }
        lines.push(getMessage('searchOutputPointOnlineGameType', replaceNull(gameType)), getMessage('searchOutputPointOnlineMode', replaceNull(mode)), getMessage('searchOutputPointOnlineMap', replaceNull(map)));
    }
    else {
        lines.push(getMessage('searchOutputPointOfflinePlaytime', replaceNull(playtime)));
        if (recentGamesPlayed > 0) {
            lines.push(getMessage('searchOutputPointOfflineGamesPlayed', String(recentGamesPlayed)));
        }
        if (recentGame
            && recentGame.startMS
            && lastLoginMS
            && lastLogoutMS
            && recentGame.startMS > lastLoginMS
            && recentGame.startMS < lastLogoutMS) {
            lines.push(newLine(getMessage('searchOutputPointRecentGamesTitle')), getMessage('searchOutputPointRecentGamesStart', replaceNull(dateTime(recentGame.startMS, false))), getMessage('searchOutputPointRecentGamesPlaytime', replaceNull(recentGame.gameLength)), getMessage('searchOutputPointRecentGamesGameType', replaceNull(recentGame.gameType)), getMessage('searchOutputPointRecentGamesMode', replaceNull(recentGame.mode)), getMessage('searchOutputPointRecentGamesMap', replaceNull(recentGame.map)));
        }
        else if (lastGame) {
            lines.push(getMessage('searchOutputPointRecentGamesLast', lastGame));
        }
    }
    if (settings.gameStats === true
        && ((isOnline === true && gameType)
            || (isOnline === false && recentGame.gameType)
            || (isOnline === false && lastGame))) {
        switch (gameType ?? recentGame.gameType ?? lastGame) {
            case 'Bed Wars':
            case 'Bedwars':
            case 'BEDWARS':
                lines.push(newLine(getMessage('searchOutputStatsBedwars', [
                    possessive,
                    bedwars.level,
                    bedwars.coins,
                    bedwars.gamesPlayed,
                    bedwars.winStreak,
                    bedwars.finalKD,
                    bedwars.KD,
                ].map((item) => String(item)))));
                break;
            case 'Duels':
            case 'DUELS':
                lines.push(newLine(getMessage('searchOutputStatsDuels', [
                    possessive,
                    duels.coins,
                    duels.cosmetics,
                    duels.KD,
                    duels.WL,
                    duels.wins,
                    duels.kills,
                    duels.deaths,
                ].map((item) => String(item)))));
                break;
            case 'Blitz Survival Games':
            case 'Blitz':
            case 'HungerGames':
            case 'SURVIVAL_GAMES':
                lines.push(newLine(getMessage('searchOutputStatsBlitz', [
                    possessive,
                    blitz.coins,
                    blitz.KD,
                    blitz.WL,
                    blitz.wins,
                    blitz.kills,
                    blitz.deaths,
                ].map((item) => String(item)))));
                break;
            case 'Pit':
            case 'PIT':
                lines.push(newLine(getMessage('searchOutputStatsPit', [
                    possessive,
                    pit.gold,
                    pit.prestige,
                    pit.playtime,
                    pit.bestStreak,
                    pit.chatMessages,
                    pit.KD,
                    pit.kills,
                    pit.deaths,
                ].map((item) => String(item)))));
                break;
            case 'SkyWars':
            case 'SKYWARS':
                lines.push(newLine(getMessage('searchOutputStatsSkywars', [
                    possessive,
                    skywars.level,
                    skywars.coins,
                    skywars.KD,
                    skywars.WL,
                    skywars.wins,
                    skywars.kills,
                    skywars.deaths,
                ].map((item) => String(item)))));
                break;
            case 'Speed UHC':
            case 'SpeedUHC':
            case 'SPEED_UHC':
                lines.push(newLine(getMessage('searchOutputStatsSpeedUHC', [
                    possessive,
                    speedUHC.coins,
                    speedUHC.KD,
                    speedUHC.WL,
                    speedUHC.wins,
                    speedUHC.kills,
                    speedUHC.deaths,
                ].map((item) => String(item)))));
                break;
            case 'UHC Champions':
            case 'UHC':
                lines.push(newLine(getMessage('searchOutputStatsUHC', [
                    possessive,
                    uhc.level,
                    uhc.coins,
                    uhc.KD,
                    uhc.WL,
                    uhc.wins,
                    uhc.kills,
                    uhc.deaths,
                ].map((item) => String(item)))));
                break;
            case 'Walls':
            case 'WALLS':
                lines.push(newLine(getMessage('searchOutputStatsWalls', [
                    possessive,
                    walls.coins,
                    walls.KD,
                    walls.WL,
                    walls.wins,
                    walls.kills,
                    walls.deaths,
                ].map((item) => String(item)))));
                break;
            case 'Mega Walls':
            case 'MegaWalls':
            case 'Walls3':
            case 'WALLS3':
                lines.push(newLine(getMessage('searchOutputStatsMegaWalls', [
                    possessive,
                    megaWalls.coins,
                    megaWalls.KD,
                    megaWalls.WL,
                    megaWalls.wins,
                    megaWalls.kills,
                    megaWalls.deaths,
                ].map((item) => String(item)))));
                break;
            // no default
        }
    }
    return lines.join('<br>');
}
function dateTime(ms, relative) {
    const date = new Date(Number(ms));
    if (!ms
        || ms < 0
        || Object.prototype.toString.call(date) !== '[object Date]') {
        return null;
    }
    return `${new Date(ms).toLocaleString(undefined, {
        timeStyle: 'medium',
        dateStyle: 'medium',
    })}${relative ? `<br>&nbsp;&#8627; ${getMessage('relative', String(cleanLength(timeAgo(ms))))}` : ''}`;
}
