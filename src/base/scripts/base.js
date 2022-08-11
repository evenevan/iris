import { i18n } from './utility/i18n.js';
i18n([
    'searchTooltip',
    'settingsTooltip',
    'historyTooltip',
    'aboutTooltip',
]);
const iframe = document.getElementById('iframe');
const search = document.getElementById('search');
const settings = document.getElementById('settings');
const history = document.getElementById('history');
const about = document.getElementById('about');
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
    search.disabled = search.id === type;
    settings.disabled = settings.id === type;
    history.disabled = history.id === type;
    about.disabled = about.id === type;
    iframe.attributes.getNamedItem('src').value = `./${type}.html`;
}
