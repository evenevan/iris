import {
    i18n,
} from './utility/i18n.js';
import { runtime } from './utility/utility.js';

(async () => {
    i18n([
        'extensionDescription',
    ]);

    const copyright = document.getElementById(
        'aboutCopyright',
    ) as HTMLSpanElement;

    copyright.innerHTML = runtime.i18n.getMessage(
        'aboutCopyright',
        String(new Date().getFullYear()),
    );
})();