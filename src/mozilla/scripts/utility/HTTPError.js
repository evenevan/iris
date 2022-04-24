export class HTTPError extends Error {
    response;
    status;
    statusText;
    url;
    constructor({ message, response, url, }) {
        super(message ??
            response?.statusText ??
            String(response?.status) ??
            'Unknown');
        this.name = 'HTTPError';
        this.response = response ?? null;
        this.status = response?.status ?? 500;
        this.statusText = response?.statusText ?? null;
        this.url = url;
        Object.setPrototypeOf(this, HTTPError.prototype);
    }
}
