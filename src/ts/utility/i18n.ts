export function i18n(ids: string[]) {
    ids.forEach(i18nString => {
        const element = document.getElementById(i18nString);
        element!.textContent = (chrome ?? browser).i18n.getMessage(i18nString);
    });
}