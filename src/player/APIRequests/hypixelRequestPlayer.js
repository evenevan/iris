import { createHTTPRequest } from '../../utility.js';
import { hypixelProcessData } from './hypixelProcessData.js';

export function hypixelRequestPlayer(uuid, apiKey) {
  return Promise.all([
    createHTTPRequest(`https://api.hypixel.net/player?uuid=${uuid}`, { headers: { 'API-Key': apiKey } }),
    createHTTPRequest(`https://api.hypixel.net/status?uuid=${uuid}`, { headers: { 'API-Key': apiKey } }),
    createHTTPRequest(`https://api.hypixel.net/recentGames?uuid=${uuid}`, { headers: { 'API-Key': apiKey } }),
  ])
  .then(data => {
    if (data[0].player === null) {
      const NotFoundError = new Error('Player data is null');
      NotFoundError.name = 'NotFoundError';
      throw NotFoundError;
    }
    return hypixelProcessData(data[0].player, data[1], data[2]);
  })
  .catch(err => {
    //No need to check if the player exists here because Hypixel returns a 200 even if no player with that UUID exists
    err.message = err.json?.cause ?? err.message;
    err.api = 'Hypixel';
    throw err;
  });
}
