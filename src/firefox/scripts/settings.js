import { i18n } from './utility/i18n.js';
import { Request } from './utility/Request.js';
import { runtime } from './utility/utility.js';
(async () => {
    i18n([
        'search',
        'settings',
        'history',
        'about',
        'settingsSettingsFirstLogin',
        'settingsSettingsFirstLoginTooltip',
        'settingsSettingsGameStats',
        'settingsSettingsGameStatsTooltip',
        'settingsSettingsLastLogout',
        'settingsSettingsLastLogoutTooltip',
        'settingsSettingsRelativeTimestamps',
        'settingsSettingsRelativeTimestampsTooltip',
        'settingsSettingsSentences',
        'settingsSettingsSentencesTooltip',
        'settingsSettingsThirdPerson',
        'settingsSettingsThirdPersonTooltip',
        'settingsSettingsHypixelAPI',
        'settingsSettingsHypixelAPITooltip',
        'settingsHypixelAPITitle',
        'settingsHypixelAPITestKeyButton',
    ]);
    // No optional dashes as Hypixel API keys must have them
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[45][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    const userSettings = await runtime.storage.sync.get(null);
    document.querySelectorAll('input[type=checkbox]')
        .forEach((element) => {
        const checkbox = element;
        checkbox.checked = userSettings[checkbox.id];
        checkbox.addEventListener('change', async () => {
            await runtime.storage.sync.set({
                [checkbox.id]: checkbox.checked,
            });
            checkbox.disabled = true;
            setTimeout(() => {
                checkbox.disabled = false;
            }, 300);
        });
    });
    const settingsHypixelAPIDescription = document.getElementById('settingsHypixelAPIDescription');
    settingsHypixelAPIDescription.innerHTML = runtime.i18n.getMessage('settingsHypixelAPIDescription');
    const apiKeyInput = document.getElementById('apiKey');
    const testAPIKeyButton = document.getElementById('testAPIKey');
    const testAPIKeyResultSpan = document.getElementById('testAPIKeyResult');
    const testAPIKeyLoading = document.getElementById('testAPIKeyLoading');
    apiKeyInput.placeholder = runtime.i18n
        .getMessage('settingsHypixelAPIInputPlaceholder');
    apiKeyInput.value = userSettings.apiKey || '';
    testAPIKeyButton.disabled = !apiKeyInput.value.match(uuidRegex);
    apiKeyInput.addEventListener('input', async () => {
        testAPIKeyButton.disabled = !apiKeyInput.value.match(uuidRegex);
        if (apiKeyInput.value.match(uuidRegex) || apiKeyInput.value === '') {
            await runtime.storage.sync.set({
                apiKey: apiKeyInput.value,
            });
        }
    });
    testAPIKeyButton.addEventListener('click', async () => {
        testAPIKeyResultSpan.textContent = '';
        testAPIKeyLoading.classList.remove('hidden');
        let request;
        try {
            request = await new Request().request('https://api.hypixel.net/key', {
                headers: {
                    'API-Key': apiKeyInput.value,
                },
            });
        }
        catch {
            request = null;
        }
        switch (request?.status) {
            case 200:
                {
                    const uses = (await Request.tryParse(request)).record.totalQueries;
                    testAPIKeyResultSpan.textContent = runtime.i18n
                        .getMessage('settingsHypixelAPI200', String(uses));
                }
                break;
            case 403:
                testAPIKeyResultSpan.innerHTML = runtime.i18n
                    .getMessage('settingsHypixelAPI403');
                break;
            default: testAPIKeyResultSpan.textContent = runtime.i18n
                .getMessage('settingsHypixelAPIdefault');
        }
    });
})();
