import { createHTTPRequest } from '../../utility.js';

export function requestUUID(username) {
  return createHTTPRequest(`https://playerdb.co/api/player/minecraft/${username}`, {})
  .then(player => player.data.player.id)
  .catch(err => {
    if (err.status === 500) err.name = 'NotFoundError';
    err.api = 'UUID';
    throw err;
  });
}
