import {
    cleanLength,
    createRatio,
    uhcScoreToLevel,
} from '../utility/utility.js';

/* eslint-disable camelcase */

//Turns the Hypixel API format into a custom format for consistency
export function processHypixel(
    {
        displayname = '',
        uuid = null,
        firstLogin = null,
        lastLogin = null,
        lastLogout = null,
        mcVersionRp = null,
        mostRecentGameType = null,
        userLanguage = 'ENGLISH',
        stats: {
            BedWars = {},
            Duels = {},
            HungerGames = {},
            Pit = {},
            SkyWars = {},
            SpeedUHC = {},
            UHC = {},
            Walls = {},
            Walls3 = {},
        } = {},
        achievements = {},
    }: {
        displayname: string | null,
        uuid: string | null,
        firstLogin: number | null,
        lastLogin: number | null,
        lastLogout: number | null,
        mcVersionRp: string | null,
        mostRecentGameType: string | null,
        userLanguage: string,
        stats: {
            BedWars: ReturnType<typeof bedwarsStats> | Record<string, never>,
            Duels: ReturnType<typeof duelsStats> | Record<string, never>,
            HungerGames: ReturnType<typeof blitzStats> | Record<string, never>,
            Pit: ReturnType<typeof pitStats> | Record<string, never>,
            SkyWars: ReturnType<typeof skywarsStats> | Record<string, never>,
            SpeedUHC: ReturnType<typeof speedUHCStats> | Record<string, never>,
            UHC: ReturnType<typeof uhcStats> | Record<string, never>,
            Walls: ReturnType<typeof wallsStats> | Record<string, never>,
            Walls3: ReturnType<typeof megaWallsStats> | Record<string, never>,
        } | Record<string, never>,
        achievements: {
            [key: string]: unknown,
        },
    },
    {
        session: {
            online = false,
            gameType = null,
            mode = null,
            map = null,
        } = {},
    }: {
        session: {
            online: boolean | null,
            gameType: string | null,
            mode: string | null,
            map: string | null,
        } | Record<string, never>,
    },
    recentGamesData: {
        games: {
            date: number | null,
            ended: number | null,
            gameType: string | null,
            mode: string | null,
            map: string | null,
        }[]
    },
) {
    const { recentGames, recentGamesPlayed } = recentGamesFormatter({
        lastLogin: lastLogin,
        lastLogout: lastLogout,
        recentGamesData: recentGamesData,
    });

    return {
        username: displayname,
        uuid: uuid,
        firstLoginMS: firstLogin,
        language: userLanguage,
        lastLoginMS: lastLogin,
        lastLogoutMS: lastLogout,
        limitedAPI: !lastLogin || !lastLogout || lastLogin < 1494864734000,
        isOnline: online,
        possessive: displayname?.endsWith('s')
            ? `${displayname}'`
            : `${displayname ?? ''}'s`,
        recentGames: recentGames,
        recentGamesPlayed: recentGamesPlayed,
        version: mcVersionRp,
        offline: online
            ? {
                  playtime: null,
                  lastGame: null,
              }
            : {
                  playtime:
                  lastLogin && lastLogout && lastLogin < lastLogout
                          ? cleanLength(lastLogout - lastLogin)
                          : null,
                  lastGame: mostRecentGameType,
              },
        online: online
            ? {
                  gameType: gameType,
                  mode: mode,
                  map: map,
              }
            : {
                  gameType: null,
                  mode: null,
                  map: null,
              },
        bedwars: bedwarsStats(BedWars, achievements),
        duels: duelsStats(Duels),
        blitz: blitzStats(HungerGames),
        pit: pitStats(Pit, achievements),
        skywars: skywarsStats(SkyWars, achievements),
        speedUHC: speedUHCStats(SpeedUHC, UHC),
        uhc: uhcStats(UHC),
        walls: wallsStats(Walls),
        megaWalls: megaWallsStats(Walls3),
    };
}

function recentGamesFormatter({
    lastLogin,
    lastLogout,
    recentGamesData: {
        games = [],
    },
}: {
    lastLogin: number | null,
    lastLogout: number | null,
    recentGamesData: {
        games: {
            date: number | null,
            ended: number | null,
            gameType: string | null,
            mode: string | null,
            map: string | null,
        }[],
    }
}) {
    const recentGames = [];
    let recentGamesPlayed = 0;

    for (let i = 0; i < games.length; i += 1) {
        const game = processAGame(games[i]);
        if (game.startMS && lastLogin) {
            if (game.startMS < lastLogin) break;

            recentGames.push(game);

            if (
                !lastLogin ||
                !lastLogout ||
                (game.startMS > lastLogin && game.startMS < lastLogout)
            ) {
                if (i <= 99) recentGamesPlayed += 1;
            }
        }
    }

    return {
        recentGames: recentGames,
        recentGamesPlayed: recentGamesPlayed,
    };
}

function processAGame({
    date = null,
    ended = null,
    gameType = null,
    mode = null,
    map = null,
}: {
    date: number | null,
    ended: number | null,
    gameType: string | null,
    mode: string | null,
    map: string | null,
}) {
    return {
        startMS: date,
        endMS: ended,
        gameLength: ended && date
            ? cleanLength(ended - date)
            : null,
        gameType: gameType,
        mode: mode,
        map: map,
    };
}

function bedwarsStats(
    {
        coins = 0,
        wins_bedwars = 0,
        games_played_bedwars = 0,
        winstreak = 0,
        final_kills_bedwars = 0,
        final_deaths_bedwars = 0,
        kills_bedwars = 0,
        deaths_bedwars = 0,
    },
    {
        bedwars_level = 0,
    },
) {
    return {
        level: bedwars_level,
        coins: coins,
        wins: wins_bedwars,
        gamesPlayed: games_played_bedwars,
        winStreak: winstreak,
        finalKD: createRatio(final_kills_bedwars, final_deaths_bedwars),
        KD: createRatio(kills_bedwars, deaths_bedwars),
    };
}

function duelsStats({
    coins = 0,
    packages = [],
    wins = 0,
    kills = 0,
    deaths = 0,
}) {
    return {
        coins: coins,
        cosmetics: packages.length,
        KD: createRatio(kills, deaths),
        WL: createRatio(wins, deaths),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function blitzStats({
    coins = 0,
    wins = 0,
    kills = 0,
    deaths = 0,
}) {
    return {
        coins: coins,
        KD: createRatio(kills, deaths),
        WL: createRatio(wins, deaths),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function pitStats(
    {
        cash_earned = 0,
        playtime_minutes = 0,
        max_streak = 0,
        chat_messages = 0,
        kills = 0,
        deaths = 0,
    },
    {
        pit_prestiges = 0,
    },
) {
    return {
        gold: cash_earned,
        prestige: pit_prestiges,
        playtime: playtime_minutes,
        bestStreak: max_streak,
        chatMessages: chat_messages,
        KD: createRatio(kills, deaths),
        kills: kills,
        deaths: deaths,
    };
}

function skywarsStats(
    {
        coins = 0,
        wins = 0,
        kills = 0,
        deaths = 0,
    },
    {
        skywars_you_re_a_star = 0,
    },
) {
    return {
        level: skywars_you_re_a_star,
        coins: coins,
        KD: createRatio(kills, deaths),
        WL: createRatio(wins, deaths),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function speedUHCStats({
    wins = 0,
    kills = 0,
    deaths = 0,
}, {
    coins = 0,
}) {
    return {
        coins: coins,
        KD: createRatio(kills, deaths),
        WL: createRatio(wins, deaths),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function uhcStats({
    score = 0,
    coins = 0,
    wins = 0,
    kills = 0,
    deaths = 0,
}) {
    return {
        level: uhcScoreToLevel(score),
        coins: coins,
        KD: createRatio(kills, deaths),
        WL: createRatio(wins, deaths),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function wallsStats({
    coins = 0,
    wins = 0,
    kills = 0,
    deaths = 0,
}) {
    return {
        coins: coins,
        KD: createRatio(kills, deaths),
        WL: createRatio(wins, deaths),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function megaWallsStats({
    coins = 0,
    wins = 0,
    kills = 0,
    deaths = 0,
}) {
    return {
        coins: coins,
        KD: createRatio(kills, deaths),
        WL: createRatio(wins, deaths),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}