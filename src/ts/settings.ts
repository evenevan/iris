import type { Sync } from './@types/index.js';
import { i18n } from './utility/i18n.js';
import { runtime } from './utility/utility.js';

i18n([
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
    'settingsSettingsServerUrl',
    'settingsSettingsServerUrlTooltip',
]);

const userSettings = (await runtime.storage.sync.get(null)) as Sync;

document.querySelectorAll<HTMLInputElement>('input[type=checkbox]').forEach((element) => {
    const checkbox = element;

    checkbox.checked = userSettings[checkbox.id as keyof typeof userSettings] as boolean;

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

const serverUrlInput = document.getElementById('serverUrl') as HTMLInputElement;
serverUrlInput.placeholder = runtime.i18n.getMessage('settingsSettingsServerUrlPlaceholder');
serverUrlInput.value = userSettings.serverUrl;

serverUrlInput.addEventListener('input', async () => {
    await runtime.storage.sync.set({
        serverUrl: serverUrlInput.value,
    });
});
