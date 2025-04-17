import {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from "discord.js";

import db from "../database/index.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import { isAuthorizedServer } from "../utils/perms.js";

export default {
  name: "set_race_price",
  description: "Set the price for race commands",
  guildOnly: true,
  permissionRequired: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "price",
      description: "Number of tickets to deduct",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],

  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    const price = interaction.options.getInteger("price", true);
    isAuthorizedServer(interaction.guild);

    db.prepare(
      `INSERT INTO guildSettings (guildId, racePrice)
       VALUES (?, ?)
       ON CONFLICT(guildId) DO UPDATE SET racePrice = excluded.racePrice`
    ).run(interaction.guildId, price);

    return await interaction.reply(
      `Race priced has been set to ${price} tickets.`
    );
  },
} satisfies extendedAPICommand;
