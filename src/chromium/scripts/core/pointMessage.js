import { cleanLength, createOffset, newLine, runtime, timeAgo, } from '../utility/utility.js';
import { replaceNull } from '../utility/i18n.js';
export function pointMessage({ username, uuid, firstLoginMS, language, lastLoginMS, lastLogoutMS, limitedAPI, isOnline, possessive, recentGames, recentGamesPlayed, version, offline: { playtime, lastGame, }, online: { gameType, mode, map, }, bedwars, duels, blitz, pit, skywars, speedUHC, uhc, walls, megaWalls, }, settings) {
    const [recentGame = {}] = recentGames;
    const getMessage = runtime.i18n.getMessage;
    const lines = [
        getMessage('mainOutputDetailGeneralUsername', username ?? ''),
        getMessage('mainOutputDetailGeneralUUID', replaceNull(uuid)),
        getMessage('mainOutputDetailGeneralStatus', isOnline
            ? getMessage('mainOutputDetailGeneralStatusOnline')
            : getMessage('mainOutputDetailGeneralStatusOffline')),
        getMessage('mainOutputDetailGeneralLimitedAPI', limitedAPI
            ? getMessage('yes')
            : getMessage('no')),
    ];
    if (lastLoginMS || lastLogoutMS) {
        lines.push(getMessage('mainOutputDetailGeneralUTCOffset', createOffset()));
    }
    lines.push(getMessage('mainOutputDetailGeneralVersion', replaceNull(version)), getMessage('mainOutputDetailGeneralLanguage', replaceNull(language)));
    if (settings.firstLogin) {
        lines.push(getMessage('mainOutputDetailGeneralFirstLogin', replaceNull(dateTime(firstLoginMS, settings.relativeTimestamps))));
    }
    lines.push(getMessage('mainOutputDetailGeneralLastLogin', replaceNull(dateTime(lastLoginMS, settings.relativeTimestamps))));
    if (settings.lastLogout) {
        lines.push(getMessage('mainOutputDetailGeneralLastLogout', replaceNull(dateTime(lastLogoutMS, settings.relativeTimestamps))));
    }
    if (isOnline) {
        lines.push(getMessage('mainOutputDetailOnlinePlaytime', replaceNull(cleanLength(timeAgo(lastLoginMS)))));
        if (recentGamesPlayed > 0) {
            lines.push(getMessage('mainOutputDetailOnlineGamesPlayed', String(recentGamesPlayed)));
        }
        lines.push(getMessage('mainOutputDetailOnlineGameType', replaceNull(gameType)), getMessage('mainOutputDetailOnlineMode', replaceNull(mode)), getMessage('mainOutputDetailOnlineMap', replaceNull(map)));
    }
    else {
        lines.push(getMessage('mainOutputDetailOfflinePlaytime', replaceNull(playtime)));
        if (recentGamesPlayed > 0) {
            lines.push(getMessage('mainOutputDetailOfflineGamesPlayed', String(recentGamesPlayed)));
        }
        if (recentGame &&
            recentGame.startMS &&
            lastLoginMS &&
            lastLogoutMS &&
            recentGame.startMS > lastLoginMS &&
            recentGame.startMS < lastLogoutMS) {
            lines.push(newLine(getMessage('mainOutputDetailRecentGamesTitle')), getMessage('mainOutputDetailRecentGamesStart', replaceNull(dateTime(recentGame.startMS, false))), getMessage('mainOutputDetailRecentGamesPlaytime', replaceNull(recentGame.gameLength)), getMessage('mainOutputDetailRecentGamesGameType', replaceNull(recentGame.gameType)), getMessage('mainOutputDetailRecentGamesMode', replaceNull(recentGame.mode)), getMessage('mainOutputDetailRecentGamesMap', replaceNull(recentGame.map)));
        }
        else if (lastGame) {
            lines.push(getMessage('mainOutputDetailRecentGamesLast', lastGame));
        }
    }
    if (settings.gameStats === true &&
        ((isOnline === true && gameType) ||
            (isOnline === false && recentGame.gameType) ||
            (isOnline === false && lastGame))) {
        switch (gameType ?? recentGame.gameType ?? lastGame) {
            case 'Bed Wars':
            case 'Bedwars':
            case 'BEDWARS':
                lines.push(newLine(getMessage('mainOutputStatsBedwars', [
                    possessive,
                    bedwars.level,
                    bedwars.coins,
                    bedwars.gamesPlayed,
                    bedwars.winStreak,
                    bedwars.finalKD,
                    bedwars.KD,
                ].map(item => String(item)))));
                break;
            case 'Duels':
            case 'DUELS':
                lines.push(newLine(getMessage('mainOutputStatsDuels', [
                    possessive,
                    duels.coins,
                    duels.cosmetics,
                    duels.KD,
                    duels.WL,
                    duels.wins,
                    duels.kills,
                    duels.deaths,
                ].map(item => String(item)))));
                break;
            case 'Blitz Survival Games':
            case 'Blitz':
            case 'HungerGames':
            case 'SURVIVAL_GAMES':
                lines.push(newLine(getMessage('mainOutputStatsBlitz', [
                    possessive,
                    blitz.coins,
                    blitz.KD,
                    blitz.WL,
                    blitz.wins,
                    blitz.kills,
                    blitz.deaths,
                ].map(item => String(item)))));
                break;
            case 'Pit':
            case 'PIT':
                lines.push(newLine(getMessage('mainOutputStatsPit', [
                    possessive,
                    pit.gold,
                    pit.prestige,
                    pit.playtime,
                    pit.bestStreak,
                    pit.chatMessages,
                    pit.KD,
                    pit.kills,
                    pit.deaths,
                ].map(item => String(item)))));
                break;
            case 'SkyWars':
            case 'SKYWARS':
                console.log('1');
                lines.push(newLine(getMessage('mainOutputStatsSkywars', [
                    possessive,
                    skywars.level,
                    skywars.coins,
                    skywars.KD,
                    skywars.WL,
                    skywars.wins,
                    skywars.kills,
                    skywars.deaths,
                ].map(item => String(item)))));
                break;
            case 'Speed UHC':
            case 'SpeedUHC':
            case 'SPEED_UHC':
                lines.push(newLine(getMessage('mainOutputStatsSpeedUHC', [
                    possessive,
                    speedUHC.coins,
                    speedUHC.KD,
                    speedUHC.WL,
                    speedUHC.wins,
                    speedUHC.kills,
                    speedUHC.deaths,
                ].map(item => String(item)))));
                break;
            case 'UHC Champions':
            case 'UHC':
                lines.push(newLine(getMessage('mainOutputStatsUHC', [
                    possessive,
                    uhc.level,
                    uhc.coins,
                    uhc.KD,
                    uhc.WL,
                    uhc.wins,
                    uhc.kills,
                    uhc.deaths,
                ].map(item => String(item)))));
                break;
            case 'Walls':
            case 'WALLS':
                lines.push(newLine(getMessage('mainOutputStatsWalls', [
                    possessive,
                    walls.coins,
                    walls.KD,
                    walls.WL,
                    walls.wins,
                    walls.kills,
                    walls.deaths,
                ].map(item => String(item)))));
                break;
            case 'Mega Walls':
            case 'MegaWalls':
            case 'Walls3':
            case 'WALLS3':
                console.log('2');
                lines.push(newLine(getMessage('mainOutputStatsMegaWalls', [
                    possessive,
                    megaWalls.coins,
                    megaWalls.KD,
                    megaWalls.WL,
                    megaWalls.wins,
                    megaWalls.kills,
                    megaWalls.deaths,
                ].map(item => String(item)))));
                break;
            //No default
        }
    }
    return lines.join('<br>');
}
function dateTime(ms, relative) {
    const date = new Date(Number(ms));
    if (!ms || ms < 0 || Object.prototype.toString.call(date) !== '[object Date]')
        return null;
    return `${new Date(ms).toLocaleString(undefined, {
        timeStyle: 'medium',
        dateStyle: 'medium',
    })}${relative ? `<br>&nbsp;&#8627; ${cleanLength(timeAgo(ms))} ago` : ''}`;
}
