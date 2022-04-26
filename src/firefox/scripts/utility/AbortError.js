import { HTTPError } from './HTTPError.js';
export class AbortError extends HTTPError {
    constructor({ message, url, }) {
        super({
            message: message,
            url: url,
        });
        this.name = 'AbortError';
        Object.setPrototypeOf(this, AbortError.prototype);
    }
}
