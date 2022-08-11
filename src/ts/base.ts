import { i18n } from './utility/i18n.js';

i18n([
    'searchTooltip',
    'settingsTooltip',
    'historyTooltip',
    'aboutTooltip',
]);

const iframe = document.getElementById('iframe') as HTMLDivElement;
const search = document.getElementById('search') as HTMLButtonElement;
const settings = document.getElementById('settings') as HTMLButtonElement;
const history = document.getElementById('history') as HTMLButtonElement;
const about = document.getElementById('about') as HTMLButtonElement;

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
    search.disabled = search.id === type;
    settings.disabled = settings.id === type;
    history.disabled = history.id === type;
    about.disabled = about.id === type;
    iframe.attributes.getNamedItem('src')!.value = `./${type}.html`;
}