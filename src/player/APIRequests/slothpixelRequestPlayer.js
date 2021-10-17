import { createHTTPRequest } from '../../utility.js';
import { slothpixelProcessData } from './slothpixelProcessData.js';

export function slothpixelRequestPlayer(player) {
  return Promise.all([
    createHTTPRequest(`https://api.slothpixel.me/api/players/${player}`, { timeout: 5000 }),
    createHTTPRequest(`https://api.slothpixel.me/api/players/${player}/status`, { timeout: 5000 }),
    createHTTPRequest(`https://api.slothpixel.me/api/players/${player}/recentGames`, { timeout: 5000 }),
  ])
  .then(data => slothpixelProcessData(data[0], data[1], data[2]))
  .catch(err => {
    if (err.status === 404) err.name = 'NotFoundError';
    err.message = err.json?.error ?? err.message;
    err.api = 'Slothpixel';
    throw err;
  });
}
