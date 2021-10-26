//This will be kept as a .js until https://github.com/tc39/proposal-import-assertions
export default {
  detail: {
    general: {
      identity: '<strong>Username:</strong> %{}%<br><strong>UUID:</strong> %{}%<br><strong>Status:</strong> %{}%',
      limitedAPI: '<br><strong>Limited/Legacy API:</strong> Missing data',
      utcOffset: '<br><strong>UTC Offset Used:</strong> %{}%',
      version: '<br><br><strong>Version:</strong> %{}%',
      language: '<br><strong>Language:</strong> %{}%',
      firstLogin: '<br><strong>First Login:</strong> %{}%',
      lastLogin: '<br><strong>Last Login:</strong> %{}%',
      lastLogout: '<br><strong>Last Logout:</strong> %{}%',
    },
    online: {
      playtime: '<br><strong>Playtime:</strong> %{}%',
      gamesPlayed: '<br><strong>Games Played:</strong> %{}%',
      gameType: '<br><strong>Game Type:</strong> %{}%',
      mode: '<br><strong>Game Mode:</strong> %{}%',
      map: '<br><strong>Game Map:</strong> %{}%',
    },
    offline: {
      playtime: '<br><strong>Last Playtime:</strong> %{}%',
      gamesPlayed: '<br><strong>Games Played:</strong> %{}%',
    },
    recentGame: {
      title: '<br><br><strong>Last Played Game:</strong>',
      start: '<br>&nbsp;<strong>Game Start:</strong> %{}%',
      playtime: '<br>&nbsp;<strong>Game Length:</strong> %{}%',
      gameType: '<br>&nbsp;<strong>Game:</strong> %{}%',
      mode: '<br>&nbsp;<strong>Mode:</strong> %{}%',
      map: '<br>&nbsp;<strong>Map:</strong> %{}%',
      last: '<br><strong>Last Game Type:</strong> %{}%',
    },
  },
  explanation: {
    general: {
      identity: '<strong>Username:</strong> %{}%<br><strong>UUID:</strong> %{}%<br><strong>Status:</strong> %{}%',
      limitedAPI: '<br><strong>Limited/Legacy API:</strong> Missing data',
      utcOffset: '<br><strong>UTC Offset Used:</strong> %{}%',
    },
    online: {
      lastLogin: '<br><br>Your current session began at %{}%.',
      firstLogin: ' You logged on for the first time on %{}%.',
      playtime: ' Your account\'s current playtime is <strong>%{}%</strong>.',
      playing: '<br><br>Your account is currently playing %{}% in %{}% on %{}%.',
      gameType: '<strong>%{}%</strong>',
      noGameType: 'an <strong>unknown</strong> game',
      mode: 'the mode <strong>%{}%</strong>',
      noMode: 'an <strong>unknown</strong> mode',
      map: 'the map <strong>%{}%</strong>',
      noMap: 'an <strong>unknown</strong> map',
      gamesPlayed: ' So far, you have played at least <strong>%{}%</strong> games.',
      using: '<br><br>Your account is using %{}% and is using %{}% on Hypixel.',
      version: 'Minecraft version <strong>%{}%</strong>',
      noVersion: 'an <strong>unidentifiable</strong> version of Minecraft',
      language: 'the language <strong>%{}%</strong>',
      noLanguage: 'an <strong>unknown</strong> language',
    },
    offline: {
      loginLogout: '<br><br>Your last session started at %{}% and ended <strong>%{}%</strong> later after logging out.',
      firstLogin: ' You logged on for the first time at %{}%.',
      using: '<br><br>Your account last used %{}% and is using %{}% on Hypixel.',
      version: 'Minecraft version <strong>%{}%</strong>',
      noVersion: 'an <strong>unidentifiable</strong> version of Minecraft',
      language: 'the language <strong>%{}%</strong>',
      noLanguage: 'an <strong>unknown</strong> language',
    },
    recentGames: {
      playedGame: '<br><br>During this session, you played %{}%%{}% at %{}% on %{}%.',
      playedGames: '<br><br>During this session, you last played %{}%. You last played %{}%%{}% at %{}% on %{}%.',
      gameType: '<strong>%{}%</strong>',
      mode: ' of mode <strong>%{}%</strong>',
      time: '<strong>%{}%</strong>',
      date: '<strong>%{}%</strong>',
      map: ' You played this game on the map <strong>%{}%</strong>.',
      playtime: ' This game lasted for <strong>%{}%</strong>.',
      noPlaytime: ' This game lasted for <strong>an unknown amount of time</strong>.',
      recentGamesPlayed: '<strong>%{}%</strong> %{}%',
      last: '<br><br>You played or joined the lobby <strong>%{}%</strong> during your last session.',
    },
  },
  stats: {
    bedwars: '<br><br><strong>%{possessive}% Stats for Bed Wars:</strong><br>&nbsp;<b>Level:</b> %{level}%<br>&nbsp;<b>Coins:</b> %{coins}%<br>&nbsp;<b>Total Games Joined:</b> %{gamesPlayed}%<br>&nbsp;<b>Winstreak:</b> %{winStreak}%<br>&nbsp;<b>Final K/D:</b> %{finalKD}%<br>&nbsp;<b>K/D:</b> %{KD}%',
    duels: '<br><br><strong>%{possessive}% Stats for Duels:</strong><br>&nbsp;<b>Coins:</b> %{coins}%<br>&nbsp;<b>Cosmetic Count:</b> %{cosmetics}%<br>&nbsp;<b>K/D Ratio:</b> %{KD}%<br>&nbsp;<b>W/L Ratio:</b> %{WL}%<br>&nbsp;<b>Wins:</b> %{wins}%<br>&nbsp;<b>Kills:</b> %{kills}%<br>&nbsp;<b>Deaths:</b> %{deaths}%',
    blitz: '<br><br><strong>%{possessive}% Stats for Blitz Survival:</strong><br>&nbsp;<b>Coins:</b> %{coins}%<br>&nbsp;<b>K/D Ratio:</b> %{KD}%<br>&nbsp;<b>W/L Ratio:</b> %{WL}%<br>&nbsp;<b>Wins:</b> %{wins}%<br>&nbsp;<b>Kills:</b> %{kills}%<br>&nbsp;<b>Deaths:</b> %{deaths}%',
    pit: '<br><br><strong>%{possessive}% Stats for the Pit:</strong><br>&nbsp;<b>Total Gold Earned:</b> %{gold}%<br>&nbsp;<b>Prestige:</b> %{prestige}%<br>&nbsp;<b>Total Playtime:</b> %{playtime}% minutes<br>&nbsp;<b>Best Streak:</b> %{bestStreak}%<br>&nbsp;<b>Chat Messages:</b> %{chatMessages}%<br>&nbsp;<b>K/D Ratio:</b> %{KD}%<br>&nbsp;<b>Kills:</b> %{kills}%<br>&nbsp;<b>Deaths:</b> %{deaths}%',
    skywars: '<br><br><strong>%{possessive}% Stats for SkyWars:</strong><br>&nbsp;<b>Level:</b> %{level}%<br>&nbsp;<b>Coins:</b> %{coins}%<br>&nbsp;<b>K/D Ratio:</b> %{KD}%<br>&nbsp;<b>W/L Ratio:</b> %{WL}%<br>&nbsp;<b>Wins:</b> %{wins}%<br>&nbsp;<b>Kills:</b> %{kills}%<br>&nbsp;<b>Deaths:</b> %{deaths}%',
    speedUHC: '<br><br><strong>%{possessive}% Stats for Speed UHC:</strong><br>&nbsp;<b>Coins:</b> %{coins}%<br>&nbsp;<b>K/D Ratio:</b> %{KD}%<br>&nbsp;<b>W/L Ratio:</b> %{WL}%<br>&nbsp;<b>Wins:</b> %{wins}%<br>&nbsp;<b>Kills:</b> %{kills}%<br>&nbsp;<b>Deaths:</b> %{deaths}%',
    uhc: '<br><br><strong>%{possessive}% Stats for UHC Champions:</strong><br>&nbsp;<b>Level:</b> %{level}%<br>&nbsp;<b>Coins:</b> %{coins}%<br>&nbsp;<b>K/D Ratio:</b> %{KD}%<br>&nbsp;<b>W/L Ratio:</b> %{WL}%<br>&nbsp;<b>Wins:</b> %{wins}%<br>&nbsp;<b>Kills:</b> %{kills}%<br>&nbsp;<b>Deaths:</b> %{deaths}%<br>',
    walls: '<br><br><strong>%{possessive}% Stats for the Walls:</strong><br>&nbsp;<b>Coins:</b> %{coins}%<br>&nbsp;<b>K/D Ratio:</b> %{KD}%<br>&nbsp;<b>W/L Ratio:</b> %{WL}%<br>&nbsp;<b>Wins:</b> %{wins}%<br>&nbsp;<b>Kills:</b> %{kills}%<br>&nbsp;<b>Deaths:</b> %{deaths}%',
    megaWalls: '<br><br><strong>%{possessive}% Stats for Mega Walls:</strong><br>&nbsp;<b>Coins:</b> %{coins}%<br>&nbsp;<b>K/D Ratio:</b> %{KD}%<br>&nbsp;<b>W/L Ratio:</b> %{WL}%<br>&nbsp;<b>Wins:</b> %{wins}%<br>&nbsp;<b>Kills:</b> %{kills}%<br>&nbsp;<b>Deaths:</b> %{deaths}%',
  },
};

export function statsDynamicReplace(string, object, possessive) {
  let newString = string;
  object.possessive = possessive;

  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      newString = newString.replace(new RegExp(`%{${key}}%`), object[key]);
    }
  }
  return newString;
}

export function replacer(string, ...variables) {
  let newString = string;

  for (const variable of variables ?? []) {
    newString = newString.replace(/%{}%/, variable);
  }
  return newString;
}
