import { i18n } from './utility/i18n.js';
import { runtime } from './utility/utility.js';

i18n(['extensionName', 'extensionDescription']);

const copyright = document.getElementById('aboutCopyright') as HTMLSpanElement;

copyright.innerHTML = runtime.i18n.getMessage('aboutCopyright', [
    String(new Date().getFullYear()),
]);
