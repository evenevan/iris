import { processSlothpixel } from './processSlothpixel.js';
import { Request } from '../utility/Request.js';
import { HTTPError } from '../utility/HTTPError.js';
import { NotFoundError } from '../utility/NotFoundError.js';
export async function getSlothpixel(uuid) {
    const request = new Request();
    const urls = [
        `https://api.slothpixel.me/api/players/${uuid}`,
        `https://api.slothpixel.me/api/players/${uuid}/status`,
        `https://api.slothpixel.me/api/players/${uuid}/recentGames`,
    ];
    const responses = await Promise.all(urls.map(async (url) => {
        const response = await request.request(url);
        if (response.ok === false) {
            if (response.status === 404) {
                throw new NotFoundError();
            }
            throw new HTTPError({
                message: response.statusText,
                response: response,
                url: url,
            });
        }
        return response;
    }));
    const data = await Promise.all(responses.map(response => Request.tryParse(response)));
    return processSlothpixel(data[0], data[1], data[2]);
}
