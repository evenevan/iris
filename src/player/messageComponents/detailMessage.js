/*eslint-disable max-statements */
/*eslint-disable complexity */
import { createOffset, cleanDate, cleanTime, timeAgo, cleanLength } from '../../utility.js';
import { default as text, statsDynamicReplace, replacer } from './en-us.js';
const { detail, stats } = text;

export function detailMessage({
  username = '',
  uuid,
  firstLoginMS,
  language,
  lastLoginMS,
  lastLogoutMS,
  limitedAPI,
  isOnline,
  possessive,
  recentGames,
  recentGamesPlayed,
  status,
  version,
  offline: {
    playtime,
    lastGame,
  },
  online: {
    gameType,
    mode,
    map,
  },
  bedwars,
  duels,
  blitz,
  pit,
  skywars,
  speedUHC,
  uhc,
  walls,
  megaWalls,
},
{
  relativeTimestamps: relativeTimestampsOption,
  firstLogin: firstLoginOption,
  lastLogout: lastLogoutOption,
  gameStats: gameStatsOption,
}) {
  let returnString = '';

  const [recentGame = {}] = recentGames;

  returnString += replacer(detail.general.identity, username, uuid, status);

  if (limitedAPI === true) returnString += replacer(detail.general.limitedAPI);
  if (lastLoginMS || lastLogoutMS) returnString += replacer(detail.general.utcOffset, createOffset());

  returnString += replacer(detail.general.version, version ?? 'Unavailable');
  returnString += replacer(detail.general.language, language ?? 'Unavailable');

  if (firstLoginOption) returnString += replacer(detail.general.firstLogin, dateTime(firstLoginMS, relativeTimestampsOption) ?? 'Unavailable');

  returnString += replacer(detail.general.lastLogin, dateTime(lastLoginMS, relativeTimestampsOption) ?? 'Unavailable');

  if (lastLogoutOption) returnString += replacer(detail.general.lastLogout, dateTime(lastLogoutMS, relativeTimestampsOption) ?? 'Unavailable');

  if (isOnline === true) {
    returnString += replacer(detail.online.playtime, cleanLength(timeAgo(lastLoginMS)) ?? 'Unavailable');
    if (recentGamesPlayed !== 0) returnString += replacer(detail.online.gamesPlayed, recentGamesPlayed);
    returnString += replacer(detail.online.gameType, gameType ?? 'Unavailable');
    returnString += replacer(detail.online.mode, mode ?? 'Unavailable');
    returnString += replacer(detail.online.map, map ?? 'Unavailable');
  } else {
    returnString += replacer(detail.offline.playtime, playtime ?? 'Unavailable');
    if (recentGamesPlayed > 0) returnString += replacer(detail.offline.gamesPlayed, recentGamesPlayed);

    if (recentGame.startMS > lastLoginMS && recentGame.startMS < lastLogoutMS) {
      returnString += replacer(detail.recentGame.title);
      returnString += replacer(detail.recentGame.start, dateTime(recentGame.startMS, false) ?? 'Unavailable');
      returnString += replacer(detail.recentGame.playtime, recentGame.gameLength ?? 'Unavailable');
      returnString += replacer(detail.recentGame.gameType, recentGame.gameType ?? 'Unavailable');
      returnString += replacer(detail.recentGame.mode, recentGame.mode ?? 'Unavailable');
      returnString += replacer(detail.recentGame.map, recentGame.map ?? 'Unavailable');
    } else if (lastGame) {
      returnString += replacer(detail.recentGame.last, lastGame);
    }
  }

  if (gameStatsOption === true && (
    (isOnline === true && gameType) ||
    (isOnline === false && recentGame.gameType) ||
    (isOnline === false && lastGame))) {
      switch (gameType ?? recentGame.gameType ?? lastGame) {
        case 'Bed Wars':
        case 'Bedwars':
        case 'BEDWARS':
          returnString += statsDynamicReplace(stats.bedwars, bedwars, possessive);
        break;
        case 'Duels':
        case 'DUELS':
          returnString += statsDynamicReplace(stats.duels, duels, possessive);
        break;
        case 'Blitz Survival Games':
        case 'Blitz':
        case 'HungerGames':
        case 'SURVIVAL_GAMES':
          returnString += statsDynamicReplace(stats.blitz, blitz, possessive);
        break;
        case 'Pit':
        case 'PIT':
          returnString += statsDynamicReplace(stats.pit, pit, possessive);
        break;
        case 'SkyWars':
        case 'SKYWARS':
          returnString += statsDynamicReplace(stats.skywars, skywars, possessive);
        break;
        case 'Speed UHC':
        case 'SpeedUHC':
        case 'SPEED_UHC':
          returnString += statsDynamicReplace(stats.speedUHC, speedUHC, possessive);
          break;
        case 'UHC Champions':
        case 'UHC':
          returnString += statsDynamicReplace(stats.uhc, uhc, possessive);
        break;
        case 'Walls':
        case 'WALLS':
          returnString += statsDynamicReplace(stats.walls, walls, possessive);
        break;
        case 'Mega Walls':
        case 'MegaWalls':
        case 'Walls3':
        case 'WALLS3':
          returnString += statsDynamicReplace(stats.megaWalls, megaWalls, possessive);
        break;
        //No default
      }
    }

  return returnString;

  function dateTime(ms, relative) {
    const date = new Date(ms);
    if (!ms || ms < 0 || Object.prototype.toString.call(date) !== '[object Date]') return null;
    return `${cleanTime(date)}, ${cleanDate(date)}${relative ? `<br>&nbsp;&#8627; ${cleanLength(timeAgo(ms))} ago` : ''}`;
  }
}
