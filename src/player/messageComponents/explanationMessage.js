/*eslint-disable max-statements */
/*eslint-disable complexity */
import { createOffset, cleanDate, cleanTime, timeAgo, cleanLength } from '../../utility.js';
import { default as text, statsDynamicReplace, replacer } from './en-us.js';
const { explanation, stats } = text;

export function explanationMessage({
  username = '',
  uuid,
  firstLoginMS,
  language,
  lastLoginMS,
  lastLogoutMS,
  limitedAPI,
  isOnline,
  possesive,
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
  authorNameOutput: authorNameOutputOption,
  relativeTimestamps: relativeTimestampsOption,
  firstLogin: firstLoginOption,
  gameStats: gameStatsOption,
}) {
  let returnString = '';

  const [recentGame = {}] = recentGames;

  returnString += replacer(explanation.general.identity, username, uuid, status);

  if (limitedAPI === true) returnString += replacer(explanation.general.limitedAPI);
  if (lastLoginMS || lastLogoutMS) returnString += replacer(explanation.general.utcOffset, createOffset());

  if (isOnline === true) {
    returnString += replacer(explanation.online.lastLogin, dateTime(lastLoginMS) ?? 'Unavailable');
    returnString += replacer(explanation.online.firstLogin, dateTime(firstLoginMS) ?? 'Unavailable');
    returnString += replacer(explanation.online.playtime, cleanLength(timeAgo(lastLoginMS)) ?? 'Unavailable');
    if (recentGamesPlayed !== 0) returnString += replacer(explanation.online.gamesPlayed, recentGamesPlayed);

    const gameTypeText = gameType ? replacer(explanation.online.gameType, gameType) : replacer(explanation.online.noGameType),
      modeText = mode ? replacer(explanation.online.mode, mode) : replacer(explanation.online.noMode),
      mapText = map ? replacer(explanation.online.map, map) : replacer(explanation.online.noMap);

    returnString += replacer(explanation.online.playing, gameTypeText, modeText, mapText);

    const versionText = gameType ? replacer(explanation.online.version, version) : replacer(explanation.online.noVersion),
      languageText = mode ? replacer(explanation.online.language, language) : replacer(explanation.online.noLanguage);

    returnString += replacer(explanation.online.using, versionText, languageText);
  } else {
    returnString += replacer(explanation.offline.loginLogout, dateTime(lastLoginMS, relativeTimestampsOption) ?? 'Unavailable', playtime ?? 'Unavailable');
    if (firstLoginOption) returnString += replacer(explanation.offline.firstLogin, dateTime(firstLoginMS, relativeTimestampsOption) ?? 'Unavailable');

    if (recentGame.startMS > lastLoginMS && recentGame.startMS < lastLogoutMS) {
      const gameTypeText = replacer(explanation.recentGames.gameType, recentGame.gameType ?? 'Unavailable'),
         modeText = replacer(explanation.recentGames.mode, recentGame.mode ?? 'Unavailable'),
         timeText = replacer(explanation.recentGames.time, cleanTime(recentGame.startMS, false) ?? 'Unavailable'),
         dateText = replacer(explanation.recentGames.date, cleanDate(recentGame.startMS, false) ?? 'Unavailable');
      if (recentGamesPlayed <= 1) {
        returnString += replacer(explanation.recentGames.playedGame, gameTypeText, modeText, timeText, dateText);
      } else {
        const recentGamesPlayedText = replacer(explanation.recentGames.recentGamesPlayed, recentGamesPlayed, recentGamesPlayed > 1 ? 'games' : 'game');
        returnString += replacer(explanation.recentGames.playedGames, recentGamesPlayedText, gameTypeText, modeText, timeText, dateText);
      }

      if (recentGame.map) returnString += replacer(explanation.recentGames.map, recentGame.map);
      if (recentGame.gameLength) returnString += replacer(explanation.recentGames.playtime, recentGame.gameLength);
      else returnString += replacer(explanation.recentGames.noPlaytime);
    } else if (lastGame) {
      returnString += replacer(explanation.recentGames.last, lastGame);
    }

    const versionText = replacer(version ? explanation.offline.version : explanation.offline.noVersion, version),
      languageText = replacer(language ? explanation.offline.language : explanation.offline.noLanguage, language);

    returnString += replacer(explanation.offline.using, versionText, languageText);
  }

  if (gameStatsOption === true && (
    (isOnline === true && gameType) ||
    (isOnline === false && recentGame.gameType) ||
    (isOnline === false && lastGame))) {
    switch (gameType ?? recentGame.gameType ?? lastGame) {
      case 'Bed Wars':
      case 'Bedwars':
      case 'BEDWARS':
        returnString += statsDynamicReplace(stats.bedwars, bedwars, possesive);
      break;
      case 'Duels':
      case 'DUELS':
        returnString += statsDynamicReplace(stats.duels, duels, possesive);
      break;
      case 'Blitz Survival Games':
      case 'Blitz':
      case 'HungerGames':
      case 'SURVIVAL_GAMES':
        returnString += statsDynamicReplace(stats.blitz, blitz, possesive);
      break;
      case 'Pit':
      case 'PIT':
        returnString += statsDynamicReplace(stats.pit, pit, possesive);
      break;
      case 'SkyWars':
      case 'SKYWARS':
        returnString += statsDynamicReplace(stats.skywars, skywars, possesive);
      break;
      case 'Speed UHC':
      case 'SpeedUHC':
      case 'SPEED_UHC':
        returnString += statsDynamicReplace(stats.speedUHC, speedUHC, possesive);
       break;
      case 'UHC Champions':
      case 'UHC':
        returnString += statsDynamicReplace(stats.uhc, uhc, possesive);
      break;
      case 'Walls':
      case 'WALLS':
        returnString += statsDynamicReplace(stats.walls, walls, possesive);
      break;
      case 'Mega Walls':
      case 'MegaWalls':
      case 'Walls3':
      case 'WALLS3':
        returnString += statsDynamicReplace(stats.megaWalls, megaWalls, possesive);
      break;
      //No default
    }
  }

  if (authorNameOutputOption === true) {
    returnString = returnString.replace(/Your/gm, possesive);
    returnString = returnString.replace(/your/gm, possesive);
    returnString = returnString.replace(/You/gm, username);
    returnString = returnString.replace(/you/gm, username);
  }

  return returnString;

  function dateTime(ms, relative) {
    const date = new Date(ms);
    if (!ms || ms < 0 || Object.prototype.toString.call(date) !== '[object Date]') return null;
    return `<strong>${cleanTime(date)}</strong> on <strong>${cleanDate(date)}</strong>${relative ? ` (<strong>${cleanLength(timeAgo(date))} ago</strong>)` : ''}`;
  }
}
