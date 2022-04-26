export function i18n(runtime, ids) {
    ids.forEach(i18nString => {
        const element = document.getElementById(i18nString);
        element.textContent = runtime.i18n.getMessage(i18nString);
    });
}
