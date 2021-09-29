import { createHTTPRequest } from '../../utility.js';

export async function requestUUID(username) {
  return createHTTPRequest(`https://playerdb.co/api/player/minecraft/${username}`)
  .then((player) => {
    return player.data.player.id;
  }).catch(err => {
    if (err.status === 500) {let newError = new Error("HTTP status " + err.status); newError.name = "NotFound"; throw newError;}
    throw err;
  });
};