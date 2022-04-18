export class Request {
    readonly restRequestTimeout: number;
    private try: number;
    readonly tryLimit: number;

    constructor(config?: {
        retryLimit?: number,
        restRequestTimeout?: number,
    }) {
        this.restRequestTimeout = config?.restRequestTimeout ?? 2500;

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
                this.try < this.tryLimit &&
                response.status >= 500 &&
                response.status < 600
            ) {
                return this.request(url, fetchOptions);
            }

            return response;
        } catch (error) {
            if (this.try < this.tryLimit) {
                return this.request(url, fetchOptions);
            }

            throw error;
        } finally {
            clearTimeout(abortTimeout);
        }
    }

    static tryParse<Type>(
        response: Response,
    ): Promise<Type | null> {
        return response
            .json()
            .catch(() => null);
    }
}