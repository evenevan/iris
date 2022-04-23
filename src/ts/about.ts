import {
    i18n,
} from './utility/i18n.js';
import { runtime } from './utility/utility.js';

(async () => {
    i18n([
        'extensionName',
        'extensionDescription',
        'main',
        'settings',
        'history',
        'about',
        'aboutChromeListing',
        'aboutMozillaListing',
    ]);

    const copyright = document.getElementById(
        'aboutCopyright',
    ) as HTMLSpanElement;

    copyright.innerHTML = runtime.i18n.getMessage(
        'aboutCopyright',
        String(new Date().getFullYear()),
    );
})();