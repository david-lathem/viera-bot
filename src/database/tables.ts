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
    kaosCommandChannelId TEXT
  )
`
);

// db.exec(
//   `
//  ALTER TABLE guildSettings ADD ticketChannelId TEXT
// `
// );
