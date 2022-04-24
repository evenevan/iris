import { AbortError } from './AbortError.js';
export class Request {
    restRequestTimeout;
    try;
    tryLimit;
    constructor(config) {
        this.restRequestTimeout = config?.restRequestTimeout ?? 5000;
        this.try = 0;
        this.tryLimit = (config?.retryLimit ?? 2) + 1;
    }
    async request(url, fetchOptions) {
        this.try += 1;
        const controller = new AbortController();
        const abortTimeout = setTimeout(() => controller.abort(), this.restRequestTimeout);
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                ...fetchOptions,
            });
            if (response.ok === true) {
                return response;
            }
            if (this.try < this.tryLimit &&
                response.status >= 500 &&
                response.status < 600) {
                return this.request(url, fetchOptions);
            }
            return response;
        }
        catch (error) {
            if (this.try < this.tryLimit) {
                return this.request(url, fetchOptions);
            }
            throw new AbortError({
                message: error?.message,
                url: url,
            });
        }
        finally {
            clearTimeout(abortTimeout);
        }
    }
    static async tryParse(response) {
        try {
            const data = await response.json();
            return data;
        }
        catch {
            return null;
        }
    }
}
