import { AbortError } from './AbortError.js';

export class Request {
    readonly restRequestTimeout: number;

    private try: number;

    readonly tryLimit: number;

    constructor(config?: {
        retryLimit?: number,
        restRequestTimeout?: number,
    }) {
        this.restRequestTimeout = config?.restRequestTimeout ?? 5000;

        this.try = 0;

        this.tryLimit = (config?.retryLimit ?? 2) + 1;
    }

    async request(url: string, fetchOptions?: RequestInit): Promise<Response> {
        this.try += 1;

        const controller = new AbortController();
        const abortTimeout = setTimeout(
            () => controller.abort(),
            this.restRequestTimeout,
        );

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                ...fetchOptions,
            });

            if (response.ok === true) {
                return response;
            }

            if (
                this.try < this.tryLimit
                && response.status >= 500
                && response.status < 600
            ) {
                return await this.request(url, fetchOptions);
            }

            return response;
        } catch (error) {
            if (this.try < this.tryLimit) {
                return await this.request(url, fetchOptions);
            }

            throw new AbortError({
                message: (error as Error)?.message,
                url: url,
            });
        } finally {
            clearTimeout(abortTimeout);
        }
    }

    static async tryParse<Type>(
        response: Response,
    ): Promise<Type | null> {
        try {
            const data = await response.json();
            return data;
        } catch {
            return null;
        }
    }
}