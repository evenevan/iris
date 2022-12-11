import type { processHypixel } from '../core/processHypixel';
import type { processSlothpixel } from '../core/processSlothpixel';

export interface History {
    input: string;
    uuid: string | null;
    username: string | null;
    apiData: ReturnType<typeof processHypixel> & ReturnType<typeof processSlothpixel>;
    epoch: number;
}

export interface Local {
    [key: string]: unknown;
    lastSearchCleared: boolean;
    lastSearch: History | null;
    history: History[];
}

export interface Sync {
    [key: string]: unknown;
    apiKey: string;
    firstLogin: boolean;
    gameStats: boolean;
    hypixelAPI: boolean;
    lastLogout: boolean;
    relativeTimestamps: boolean;
    sentences: boolean;
    thirdPerson: boolean;
}
