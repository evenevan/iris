import { processHypixel } from './processHypixel.js';
import { Request } from '../utility/Request.js';
import { HTTPError } from '../utility/HTTPError.js';
import { NotFoundError } from '../utility/NotFoundError.js';

export async function getHypixel(uuid: string, apiKey: string) {
    const request = new Request();

    const fetchOptions = {
        headers: {
            'API-Key': apiKey,
        },
    };

    const urls = [
        `https://api.hypixel.net/player?uuid=${uuid}`,
        `https://api.hypixel.net/status?uuid=${uuid}`,
        `https://api.hypixel.net/recentGames?uuid=${uuid}`,
    ];

    const responses = await Promise.all(
        urls.map(async url => {
            const response = await request.request(url, fetchOptions);

            if (response.ok === false) {
                throw new HTTPError({
                    message: response.statusText,
                    response: response,
                    url: url,
                });
            }

            return response;
        }),
    );

    const data = await Promise.all(
        responses.map(response => Request.tryParse<{
            [key: string]: unknown
        }>(response)),
    );

    if (data[0]?.player === null) {
        throw new NotFoundError();
    }

    //@ts-expect-error trust me bro
    return processHypixel(data[0].player, data[1], data[2]);
}