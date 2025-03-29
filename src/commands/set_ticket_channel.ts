import {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  ChannelType,
  TextChannel,
  PermissionFlagsBits,
} from "discord.js";

import db from "../database/index.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import { isAuthorizedServer } from "../utils/perms.js";

export default {
  name: "set_ticket_channel",
  description: "Set the channel for ticket commands.",
  guildOnly: true,
  permissionRequired: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "channel",
      description: "The channel to set for ticket commands.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
      channel_types: [ChannelType.GuildText],
    },
  ],

  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    const channel = interaction.options.getChannel("channel") as TextChannel;

    isAuthorizedServer(interaction.guild);

    db.prepare(
      `INSERT INTO guildSettings (guildId, ticketChannelId)
       VALUES (?, ?)
       ON CONFLICT(guildId) DO UPDATE SET ticketChannelId = excluded.ticketChannelId`
    ).run(interaction.guildId, channel.id);

    return await interaction.reply(
      `Ticket command channel has been set to ${channel.toString()}.`
    );
  },
} satisfies extendedAPICommand;
