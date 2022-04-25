import { i18n, } from './utility/i18n.js';
import { runtime } from './utility/utility.js';
(async () => {
    i18n([
        'extensionName',
        'extensionDescription',
        'search',
        'settings',
        'history',
        'about',
        'aboutChromeListing',
        'aboutMozillaListing',
    ]);
    const copyright = document.getElementById('aboutCopyright');
    copyright.innerHTML = runtime.i18n.getMessage('aboutCopyright', [
        runtime.runtime.getManifest().version,
        String(new Date().getFullYear()),
    ]);
})();