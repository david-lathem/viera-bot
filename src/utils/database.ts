import { getGuildById } from "../database/queries.js";
import { Guild } from "./typings/types.js";

export const getGuildRowThrowErrIfNot = (guildId: string): Guild => {
  const guildRow = getGuildById.get({ guildId });

  if (!guildRow)
    throw new Error("Please install the bot in server first using /install");

  console.log(guildRow);

  guildRow.raceConfig = JSON.parse(guildRow.raceConfig as unknown as string); // sqlite returns as string

  console.log(guildRow);

  return guildRow;
};
