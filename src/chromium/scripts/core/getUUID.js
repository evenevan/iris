import { Request } from '../utility/Request.js';
export async function getUUID(username) {
    const response = await new Request()
        .request(`https://playerdb.co/api/player/minecraft/${username}`);
    const object = await Request.tryParse(response);
    if (response.ok && object) {
        return object.data.player.id;
    }
    throw new Error();
}
