import { cleanGameMode, cleanGameType, cleanLength, maxDecimals } from '../utility/utility.js';

/* eslint-disable camelcase */

// Turns the Hypixel API format into a custom format for consistency
export function processSlothpixel(
    {
        username = '',
        uuid = null,
        first_login = null,
        language = 'ENGLISH',
        last_login = null,
        last_logout = null,
        last_game = null,
        mc_version = null,
        stats: {
            BedWars = {},
            Duels = {
                general: {},
            },
            Blitz = {},
            Pit = {},
            SkyWars = {},
            SpeedUHC = {},
            UHC = {},
            Walls = {},
            MegaWalls = {},
        } = {},
    }: {
        username: string | null;
        uuid: string | null;
        first_login: number | null;
        language: string;
        last_login: number | null;
        last_logout: number | null;
        last_game: string | null;
        mc_version: string | null;
        stats:
        | {
            BedWars: ReturnType<typeof bedwarsStats> | Record<string, never>;
            Duels:
            | {
                general: ReturnType<typeof duelsStats> | Record<string, never>;
            }
            | Record<string, never>;
            Blitz: ReturnType<typeof blitzStats> | Record<string, never>;
            Pit: ReturnType<typeof pitStats> | Record<string, never>;
            SkyWars: ReturnType<typeof skywarsStats> | Record<string, never>;
            SpeedUHC: ReturnType<typeof speedUHCStats> | Record<string, never>;
            UHC: ReturnType<typeof uhcStats> | Record<string, never>;
            Walls: ReturnType<typeof wallsStats> | Record<string, never>;
            MegaWalls: ReturnType<typeof megaWallsStats> | Record<string, never>;
        }
        | Record<string, never>;
    },
    {
        online = null,
        game: { type = null, mode = null, map = null } = {},
    }: {
        online: boolean | null;
        game:
        | {
            type: string | null;
            mode: string | null;
            map: string | null;
        }
        | Record<string, never>;
    },
    recentGamesData: {
        date: number | null;
        ended: number | null;
        gameType: string | null;
        mode: string | null;
        map: string | null;
    }[],
) {
    const { recentGames, recentGamesPlayed } = recentGamesFormatter({
        last_login: last_login,
        last_logout: last_logout,
        recentGamesData: recentGamesData,
    });

    return {
        username: username,
        uuid: uuid,
        firstLoginMS: first_login,
        language: language,
        lastLoginMS: last_login,
        lastLogoutMS: last_logout,
        limitedAPI: !last_login || !last_logout || last_login < 1494864734000,
        isOnline: online,
        possessive: username?.endsWith('s') ? `${username}'` : `${username ?? ''}'s`,
        recentGames: recentGames,
        recentGamesPlayed: recentGamesPlayed,
        version: mc_version,
        offline: online
            ? {
                playtime: null,
                lastGame: null,
            }
            : {
                playtime:
                      last_login && last_logout && last_login < last_logout
                          ? cleanLength(last_logout - last_login)
                          : null,
                lastGame: cleanGameType(last_game),
            },
        online: online
            ? {
                gameType: cleanGameType(type),
                mode: cleanGameMode(mode),
                map: map,
            }
            : {
                gameType: null,
                mode: null,
                map: null,
            },
        bedwars: bedwarsStats(BedWars),
        duels: duelsStats(Duels.general),
        blitz: blitzStats(Blitz),
        pit: pitStats(Pit),
        skywars: skywarsStats(SkyWars),
        speedUHC: speedUHCStats(SpeedUHC),
        uhc: uhcStats(UHC),
        walls: wallsStats(Walls),
        megaWalls: megaWallsStats(MegaWalls),
    };
}

function recentGamesFormatter({
    last_login,
    last_logout,
    recentGamesData = [],
}: {
    last_login: number | null;
    last_logout: number | null;
    recentGamesData: {
        date: number | null;
        ended: number | null;
        gameType: string | null;
        mode: string | null;
        map: string | null;
    }[];
}) {
    const recentGames = [];
    let recentGamesPlayed = 0;

    for (let i = 0; i < recentGamesData.length; i += 1) {
        const recentGameData = recentGamesData[i];
        const game = recentGameData && processAGame(recentGameData);

        if (game && game.startMS && last_login) {
            if (game.startMS < last_login) break;
            recentGames.push(game);
            if (
                !last_login
                || !last_logout
                || (game.startMS > last_login && game.startMS < last_logout)
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
    date: number | null;
    ended: number | null;
    gameType: string | null;
    mode: string | null;
    map: string | null;
}) {
    return {
        startMS: date,
        endMS: ended,
        gameLength: ended && date ? cleanLength(ended - date) : null,
        gameType: cleanGameType(gameType),
        mode: cleanGameMode(mode),
        map: map,
    };
}

function bedwarsStats({
    level = 0,
    coins = 0,
    wins_bedwars = 0,
    games_played = 0,
    winstreak = 0,
    final_k_d = 0,
    k_d = 0,
}) {
    return {
        level: level,
        coins: coins,
        wins: wins_bedwars,
        gamesPlayed: games_played,
        winStreak: winstreak,
        finalKD: maxDecimals(final_k_d),
        KD: maxDecimals(k_d),
    };
}

function duelsStats({
    coins = 0,
    packages = [],
    kd_ratio = 0,
    win_loss_ratio = 0,
    wins = 0,
    kills = 0,
    deaths = 0,
}) {
    return {
        coins: coins,
        cosmetics: packages.length,
        KD: maxDecimals(kd_ratio),
        WL: maxDecimals(win_loss_ratio),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function blitzStats({ coins = 0, k_d = 0, win_loss = 0, wins = 0, kills = 0, deaths = 0 }) {
    return {
        coins: coins,
        KD: maxDecimals(k_d),
        WL: maxDecimals(win_loss),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function pitStats({
    gold_earned = 0,
    prestige = 0,
    playtime_minutes = 0,
    max_streak = 0,
    chat_messages = 0,
    kd_ratio = 0,
    kills = 0,
    deaths = 0,
}) {
    return {
        gold: gold_earned,
        prestige: prestige,
        playtime: playtime_minutes,
        bestStreak: max_streak,
        chatMessages: chat_messages,
        KD: maxDecimals(kd_ratio),
        kills: kills,
        deaths: deaths,
    };
}

function skywarsStats({
    level = 0,
    coins = 0,
    kill_death_ratio = 0,
    win_loss_ratio = 0,
    wins = 0,
    kills = 0,
    deaths = 0,
}) {
    return {
        level: level,
        coins: coins,
        KD: maxDecimals(kill_death_ratio),
        WL: maxDecimals(win_loss_ratio),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function speedUHCStats({ coins = 0, kd = 0, win_loss = 0, wins = 0, kills = 0, deaths = 0 }) {
    return {
        coins: coins,
        KD: maxDecimals(kd),
        WL: maxDecimals(win_loss),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function uhcStats({ level = 0, coins = 0, kd = 0, win_loss = 0, wins = 0, kills = 0, deaths = 0 }) {
    return {
        level: level,
        coins: coins,
        KD: maxDecimals(kd),
        WL: maxDecimals(win_loss),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function wallsStats({ coins = 0, kd = 0, win_loss = 0, wins = 0, kills = 0, deaths = 0 }) {
    return {
        coins: coins,
        KD: maxDecimals(kd),
        WL: maxDecimals(win_loss),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}

function megaWallsStats({
    coins = 0,
    kill_death_ratio = 0,
    win_loss_ratio = 0,
    wins = 0,
    kills = 0,
    deaths = 0,
}) {
    return {
        coins: coins,
        KD: maxDecimals(kill_death_ratio),
        WL: maxDecimals(win_loss_ratio),
        wins: wins,
        kills: kills,
        deaths: deaths,
    };
}
