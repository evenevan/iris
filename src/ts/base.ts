import { i18n } from './utility/i18n.js';

i18n([
    'baseSearchTooltip',
    'baseSettingsTooltip',
    'baseHistoryTooltip',
    'baseAboutTooltip',
    'baseGitHubTooltip',
    'baseChromeListingTooltip',
    'baseFirefoxListingTooltip',
]);

/* eslint-disable no-param-reassign */

const search = document.getElementById('search') as HTMLButtonElement;
const settings = document.getElementById('settings') as HTMLButtonElement;
const history = document.getElementById('history') as HTMLButtonElement;
const about = document.getElementById('about') as HTMLButtonElement;

const searchIframe = document.getElementById('searchIframe') as HTMLIFrameElement;
const settingsIframe = document.getElementById('settingsIframe') as HTMLIFrameElement;
const historyIframe = document.getElementById('historyIframe') as HTMLIFrameElement;
const aboutIframe = document.getElementById('aboutIframe') as HTMLIFrameElement;

// Somehow removes a weird flash ¯\_(ツ)_/¯
searchIframe.classList.remove('hidden');

search.addEventListener('click', () => {
    updateIFrame('search');
});

settings.addEventListener('click', () => {
    updateIFrame('settings');
});

history.addEventListener('click', () => {
    updateIFrame('history');
});

about.addEventListener('click', () => {
    updateIFrame('about');
});

function updateIFrame(type: string) {
    [search, settings, history, about].forEach((page) => {
        page.disabled = page.id === type;
    });

    [searchIframe, settingsIframe, historyIframe, aboutIframe].forEach((iFrame) => {
        if (`${type}Iframe` === iFrame.id) {
            iFrame.classList.remove('hidden');
        } else {
            iFrame.classList.add('hidden');
        }
    });
}
