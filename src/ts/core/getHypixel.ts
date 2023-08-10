import { processHypixel } from './processHypixel.js';
import { Request } from '../utility/Request.js';
import { HTTPError } from '../utility/HTTPError.js';
import { NotFoundError } from '../utility/NotFoundError.js';

export async function getHypixel(uuid: string, serverUrl: string) {
    const request = new Request();

    const urls = [
        `${serverUrl}/player?uuid=${uuid}`,
        `${serverUrl}/status?uuid=${uuid}`,
        `${serverUrl}/recentGames?uuid=${uuid}`,
    ];

    const responses = await Promise.all(
        urls.map(async (url) => {
            const response = await request.request(url);

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
        responses.map((response) => Request.tryParse<{
            [key: string]: unknown;
        }>(response)),
    );

    if (data[0]?.player) {
        const processed = processHypixel(
            data[0].player as Parameters<typeof processHypixel>[0],
            data[1] as Parameters<typeof processHypixel>[1],
            data[2] as Parameters<typeof processHypixel>[2],
        );

        return processed;
    }

    throw new NotFoundError();
}
