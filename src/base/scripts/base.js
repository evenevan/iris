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
const search = document.getElementById('search');
const settings = document.getElementById('settings');
const history = document.getElementById('history');
const about = document.getElementById('about');
const searchIframe = document.getElementById('searchIframe');
const settingsIframe = document.getElementById('settingsIframe');
const historyIframe = document.getElementById('historyIframe');
const aboutIframe = document.getElementById('aboutIframe');
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
function updateIFrame(type) {
    [search, settings, history, about].forEach((page) => {
        page.disabled = page.id === type;
    });
    [searchIframe, settingsIframe, historyIframe, aboutIframe].forEach((iFrame) => {
        if (`${type}Iframe` === iFrame.id) {
            iFrame.classList.remove('hidden');
        }
        else {
            iFrame.classList.add('hidden');
        }
    });
}
