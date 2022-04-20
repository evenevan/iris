import { runtime } from './utility.js';

export function i18n(ids: string[]) {
    ids.forEach(i18nString => {
        const element = document.getElementById(i18nString);
        element!.textContent = runtime.i18n.getMessage(i18nString);
    });
}

export function replaceNull<T>(data: T) {
    return data ?? runtime.i18n.getMessage('null');
}