import { defaultRewardsConfig } from "../utils/constants.js";
import {
  CurrencyUpdatOptions,
  Guild,
  GuildIdQuery,
  KaosItem,
  kaosItemQuery,
  RewardConfigUpdateOptions,
} from "../utils/typings/types.js";
import db from "./index.js";

export const getlAllGuilds = db.prepare<{}, Guild>(
  "SELECT * FROM guildSettings"
);

export const getGuildById = db.prepare<GuildIdQuery, Guild>(
  "SELECT * FROM guildSettings WHERE guildId = @guildId"
);

export const createGuildRow = db.prepare<GuildIdQuery, Guild>(
  "INSERT INTO guildSettings (guildId) VALUES (@guildId)"
);

export const deleteGuildRow = db.prepare<GuildIdQuery>(
  "DELETE FROM guildSettings WHERE guildId = @guildId"
);

export const updateRaceConfigReward = db.prepare<RewardConfigUpdateOptions>(
  "UPDATE guildSettings SET raceConfig = json_replace(raceConfig, @path , @points) WHERE guildId = @guildId"
);

export const updateRaceConfigCurrency = db.prepare<CurrencyUpdatOptions>(
  "UPDATE guildSettings SET raceConfig = json_replace(raceConfig, '$.currency' , @currency) WHERE guildId = @guildId"
);

export const resetRaceConfig = db.prepare<GuildIdQuery>(
  `UPDATE guildSettings SET raceConfig = ${defaultRewardsConfig} WHERE guildId = @guildId`
);

export const getAllKaosItem = db.prepare<GuildIdQuery, KaosItem>(
  "SELECT * FROM kaosItems WHERE guildId = @guildId"
);

export const getKaosItem = db.prepare<kaosItemQuery, KaosItem>(
  "SELECT * FROM kaosItems WHERE guildId = @guildId AND kaosId = @kaosId"
);

export const insertKaosItem = db.prepare<KaosItem>(
  `INSERT INTO kaosItems (guildId, name, kaosId, quantity, odds, type, threeXWin)
   VALUES (@guildId, @name , @kaosId, @quantity, @odds, @type, @threeXWin)`
);

export const deleteKaosItem = db.prepare<kaosItemQuery>(
  "DELETE FROM kaosItems WHERE guildId = @guildId AND kaosId = @kaosId"
);
