import type { processHypixel } from '../core/processHypixel';

export interface History {
    input: string;
    uuid: string | null;
    username: string | null;
    apiData: ReturnType<typeof processHypixel>;
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
    firstLogin: boolean;
    gameStats: boolean;
    serverUrl: string;
    lastLogout: boolean;
    relativeTimestamps: boolean;
    sentences: boolean;
    thirdPerson: boolean;
}
