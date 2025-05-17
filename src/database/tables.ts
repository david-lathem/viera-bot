import { defaultRewardsConfig } from "../utils/constants.js";
import db from "./index.js";

db.exec(
  `
  CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    tickets INTEGER DEFAULT 0
  )
`
);

db.exec(
  `
  CREATE TABLE IF NOT EXISTS guildSettings (
    guildId TEXT PRIMARY KEY,
    kaosCommandChannelId TEXT,
    ticketChannelId TEXT,
    raceConfig TEXT DEFAULT ${defaultRewardsConfig}
  )
`
);

db.exec(`
  CREATE TABLE IF NOT EXISTS kaosItems (
    guildId TEXT NOT NULL,
    name TEXT NOT NULL,
    kaosId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    odds INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('POINTS', 'KIT', 'ITEM')),
    threeXWin BOOLEAN NOT NULL,
    FOREIGN KEY (guildId) REFERENCES guildSettings(guildId) ON DELETE CASCADE
  );
`);

// db.exec(
//   `
//  ALTER TABLE guildSettings ADD ticketChannelId TEXT
// `
// );
// db.exec(
//   `
//  ALTER TABLE users ADD lastDailyClaimedTimestamp INTEGER
// `
// );
