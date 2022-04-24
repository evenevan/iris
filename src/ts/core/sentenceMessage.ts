import {
    cleanLength,
    cleanTime,
    createOffset,
    runtime,
    timeAgo,
} from '../utility/utility.js';
import { processHypixel } from './processHypixel.js';
import { processSlothpixel } from './processSlothpixel.js';
import { replaceNull } from '../utility/i18n.js';

const getMessage = runtime.i18n.getMessage;

export function sentenceMessage(
    {
        username,
        uuid,
        firstLoginMS,
        language,
        lastLoginMS,
        lastLogoutMS,
        limitedAPI,
        isOnline,
        possessive,
        recentGames,
        recentGamesPlayed,
        version,
        offline: { lastGame },
        online: { gameType, mode, map },
        bedwars,
        duels,
        blitz,
        pit,
        skywars,
        speedUHC,
        uhc,
        walls,
        megaWalls,
    }: ReturnType<typeof processHypixel> & ReturnType<typeof processSlothpixel>,
    settings: {
        apiKey: string;
        firstLogin: boolean;
        gameStats: boolean;
        hypixelAPI: boolean;
        lastLogout: boolean;
        relativeTimestamps: boolean;
        sentences: boolean;
        thirdPerson: boolean;
    },
): string {
    const [recentGame = {}] = recentGames as
        | typeof recentGames
        | Record<string, never>[];

    const block1: string[] = [
        getMessage('mainOutputSentenceGeneralUsername', username ?? ''),
        getMessage('mainOutputSentenceGeneralUUID', replaceNull(uuid)),
        getMessage(
            'mainOutputSentenceGeneralStatus',
            isOnline
                ? getMessage('mainOutputSentenceGeneralStatusOnline')
                : getMessage('mainOutputSentenceGeneralStatusOffline'),
        ),
        getMessage(
            'mainOutputSentenceGeneralLimitedAPI',
            limitedAPI ? getMessage('yes') : getMessage('no'),
        ),
    ];

    const block2: string[] = [];

    const block3: string[] = [];

    const block4: string[] = [];

    if (lastLoginMS || lastLogoutMS) {
        block1.push(
            getMessage('mainOutputSentenceGeneralUTCOffset', createOffset()),
        );
    }

    if (settings.firstLogin) {
        block2.push(
            getMessage('mainOutputSentenceGeneralFirstLogin', [
                replaceNull(cleanTime(firstLoginMS)),
                replaceNull(
                    cleanDateRelative(firstLoginMS, settings.firstLogin),
                ),
            ]),
        );
    }

    if (isOnline) {
        block2.push(
            getMessage('mainOutputSentenceOnlineSettings', [
                language,
                replaceNull(version),
            ]),
        );

        block3.push(
            `${getMessage('mainOutputSentenceOnlineLastSession', [
                replaceNull(cleanTime(lastLoginMS)),
                replaceNull(
                    cleanDateRelative(lastLoginMS, settings.relativeTimestamps),
                ),
            ])} ${getMessage(
                'mainOutputSentenceOnlineGamesCount',
                String(recentGamesPlayed),
            )} ${getMessage('mainOutputSentenceOnlineGamesGame', [
                replaceNull(gameType),
                replaceNull(mode),
                replaceNull(map),
            ])}`,
        );
    } else {
        block2.push(
            getMessage('mainOutputSentenceOfflineSettings', [
                language,
                replaceNull(version),
            ]),
        );

        let gameData = `${getMessage('mainOutputSentenceOfflineLastSession', [
            replaceNull(cleanTime(lastLoginMS)),
            replaceNull(
                cleanDateRelative(lastLoginMS, settings.relativeTimestamps),
            ),
            replaceNull(
                cleanLength(Number(lastLogoutMS) - Number(lastLoginMS)),
            ),
        ])}`;

        if (recentGames.length > 0) {
            gameData += ` ${getMessage(
                'mainOutputSentenceOfflineGamesCount',
                String(recentGamesPlayed),
            )} ${getMessage('mainOutputSentenceOfflineGamesGame', [
                replaceNull(recentGame.gameType),
                replaceNull(recentGame.mode),
                replaceNull(recentGame.map),
            ])}`;
        } else if (lastGame) {
            gameData += ` ${getMessage('mainOutputSentenceOfflineLastGame', [
                replaceNull(lastGame),
            ])}`;
        }

        block3.push(gameData);
    }

    if (
        settings.gameStats === true &&
        (
            (isOnline === true && gameType) ||
            (isOnline === false && recentGame.gameType) ||
            (isOnline === false && lastGame)
        )
    ) {
        switch (gameType ?? recentGame.gameType ?? lastGame) {
            case 'Bed Wars':
            case 'Bedwars':
            case 'BEDWARS':
                block4.push(
                    getMessage(
                        'mainOutputStatsBedwars',
                        [
                            possessive,
                            bedwars.level,
                            bedwars.coins,
                            bedwars.gamesPlayed,
                            bedwars.winStreak,
                            bedwars.finalKD,
                            bedwars.KD,
                        ].map(item => String(item)),
                    ),
                );
                break;
            case 'Duels':
            case 'DUELS':
                block4.push(
                    getMessage(
                        'mainOutputStatsDuels',
                        [
                            possessive,
                            duels.coins,
                            duels.cosmetics,
                            duels.KD,
                            duels.WL,
                            duels.wins,
                            duels.kills,
                            duels.deaths,
                        ].map(item => String(item)),
                    ),
                );
                break;
            case 'Blitz Survival Games':
            case 'Blitz':
            case 'HungerGames':
            case 'SURVIVAL_GAMES':
                block4.push(
                    getMessage(
                        'mainOutputStatsBlitz',
                        [
                            possessive,
                            blitz.coins,
                            blitz.KD,
                            blitz.WL,
                            blitz.wins,
                            blitz.kills,
                            blitz.deaths,
                        ].map(item => String(item)),
                    ),
                );
                break;
            case 'Pit':
            case 'PIT':
                block4.push(
                    getMessage(
                        'mainOutputStatsPit',
                        [
                            possessive,
                            pit.gold,
                            pit.prestige,
                            pit.playtime,
                            pit.bestStreak,
                            pit.chatMessages,
                            pit.KD,
                            pit.kills,
                            pit.deaths,
                        ].map(item => String(item)),
                    ),
                );
                break;
            case 'SkyWars':
            case 'SKYWARS':
                block4.push(
                    getMessage(
                        'mainOutputStatsSkywars',
                        [
                            possessive,
                            skywars.level,
                            skywars.coins,
                            skywars.KD,
                            skywars.WL,
                            skywars.wins,
                            skywars.kills,
                            skywars.deaths,
                        ].map(item => String(item)),
                    ),
                );
                break;
            case 'Speed UHC':
            case 'SpeedUHC':
            case 'SPEED_UHC':
                block4.push(
                    getMessage(
                        'mainOutputStatsSpeedUHC',
                        [
                            possessive,
                            speedUHC.coins,
                            speedUHC.KD,
                            speedUHC.WL,
                            speedUHC.wins,
                            speedUHC.kills,
                            speedUHC.deaths,
                        ].map(item => String(item)),
                    ),
                );
                break;
            case 'UHC Champions':
            case 'UHC':
                block4.push(
                    getMessage(
                        'mainOutputStatsUHC',
                        [
                            possessive,
                            uhc.level,
                            uhc.coins,
                            uhc.KD,
                            uhc.WL,
                            uhc.wins,
                            uhc.kills,
                            uhc.deaths,
                        ].map(item => String(item)),
                    ),
                );
                break;
            case 'Walls':
            case 'WALLS':
                block4.push(
                    getMessage(
                        'mainOutputStatsWalls',
                        [
                            possessive,
                            walls.coins,
                            walls.KD,
                            walls.WL,
                            walls.wins,
                            walls.kills,
                            walls.deaths,
                        ].map(item => String(item)),
                    ),
                );
                break;
            case 'Mega Walls':
            case 'MegaWalls':
            case 'Walls3':
            case 'WALLS3':
                block4.push(
                    getMessage(
                        'mainOutputStatsMegaWalls',
                        [
                            possessive,
                            megaWalls.coins,
                            megaWalls.KD,
                            megaWalls.WL,
                            megaWalls.wins,
                            megaWalls.kills,
                            megaWalls.deaths,
                        ].map(item => String(item)),
                    ),
                );
                break;
            //No default
        }
    }

    const messages = [
        block1.join('<br>'),
        block2.join(' '),
        block3.join(' '),
        block4.join(' '),
    ]
        .map(block => (
            settings.thirdPerson
                ? block
                    .replace(/Your/gim, possessive)
                    .replace(/You/gim, username ?? '')
                : block
        ))
        .join('<br><br>');

    return messages;
}

function cleanDateRelative(ms: number | null, relative: boolean) {
    const date = new Date(Number(ms));
    if (
        !ms ||
        ms < 0 ||
        Object.prototype.toString.call(date) !== '[object Date]'
    ) {
        return null;
    }

    return `${new Date(ms).toLocaleString(undefined, {
        dateStyle: 'medium',
    })}${
        relative ? ` (${getMessage('relative', String(cleanLength(timeAgo(ms))))})` : ''
    }`;
}