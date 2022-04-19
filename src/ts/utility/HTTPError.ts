export class HTTPError extends Error {
    readonly response: Response | null;
    readonly status: number;
    readonly statusText: string | null;
    readonly url: string;

    constructor({
        message,
        response,
        url,
    }: {
        message?: string,
        response?: Response,
        url: string;
    }) {
        super(
            message ??
            response?.statusText ??
            String(response?.status) ??
            'Unknown',
        );
        this.name = 'HTTPError';
        this.response = response ?? null;
        this.status = response?.status ?? 500;
        this.statusText = response?.statusText ?? null;
        this.url = url;

        Object.setPrototypeOf(this, HTTPError.prototype);
    }
}