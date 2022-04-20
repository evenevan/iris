import { processHypixel } from './processHypixel';
import { processSlothpixel } from './processSlothpixel';

export function sentenceMessage({
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
  }: ReturnType<typeof processHypixel> & ReturnType<typeof processSlothpixel>,
  settings: {
    apiKey: string,
    firstLogin: boolean,
    gameStats: boolean,
    hypixelAPI: boolean,
    lastLogout: boolean,
    relativeTimestamps: boolean,
    sentences: boolean,
    thirdPerson: boolean,
},
): string {
    return '';
}