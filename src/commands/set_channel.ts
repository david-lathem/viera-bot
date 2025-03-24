import {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  ChannelType,
  TextChannel,
  PermissionFlagsBits,
} from "discord.js";

import db from "../database/index.js";
import { extendedAPICommand } from "../utils/typings/types.js";

export default {
  name: "set_kaos_channel",
  description: "Set the channel for Kaos commands.",
  guildOnly: true,
  permissionRequired: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "channel",
      description: "The channel to set for Kaos commands.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
      channel_types: [ChannelType.GuildText],
    },
  ],

  execute: async (interaction: ChatInputCommandInteraction) => {
    const channel = interaction.options.getChannel("channel") as TextChannel;

    db.prepare(
      `INSERT INTO guildSettings (guildId, kaosCommandChannelId)
       VALUES (?, ?)
       ON CONFLICT(guildId) DO UPDATE SET kaosCommandChannelId = excluded.kaosCommandChannelId`
    ).run(interaction.guildId, channel.id);

    return await interaction.reply(
      `Kaos command channel has been set to ${channel.toString()}.`
    );
  },
} satisfies extendedAPICommand;
