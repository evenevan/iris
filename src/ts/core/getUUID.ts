import { Request } from '../utility/Request.js';

export async function getUUID(username: string) {
    const response = await new Request()
        .request(`https://playerdb.co/api/player/minecraft/${username}`);

    const object = await Request.tryParse<{
        code: string,
        message: string,
        data: {
            player: {
                meta: {
                    name_history: string[],
                },
                username: string,
                id: string,
                raw_id: string,
                avatar: string,
            }
        },
        success: boolean,
    }>(response);

    if (response.ok && object) {
        return object.data.player.id;
    }

    throw new Error();
}