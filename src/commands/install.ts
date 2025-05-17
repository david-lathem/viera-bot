import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";

import { extendedAPICommand } from "../utils/typings/types.js";
import { isAdmin } from "../utils/perms.js";
import { createGuildRow, getGuildById } from "../database/queries.js";

export default {
  name: "install",
  description: "Installs the bot in the current server or another server",
  options: [
    {
      name: "server_id",
      description:
        "ID of server/guild (if provided) else bot will setup in current server",
      type: ApplicationCommandOptionType.String,
    },
  ],
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply();
    const { user } = interaction;

    let guildId = interaction.options.getString("server_id");

    if (!guildId) guildId = interaction.guildId;

    // if guild id is provided, we check if bot is in there and member has enough perms

    const guild = interaction.client.guilds.cache.get(guildId);

    if (!guild)
      throw new Error(
        "I am not present in the server you have asked to setup, please add me there!"
      );

    // now we check if he has admin perms there

    const member = await guild.members.fetch(user.id).catch(console.log);

    if (!member) throw new Error("You are not present in the said server");

    isAdmin(member); // throws error if not admin

    // Check if row exists
    const guildRow = getGuildById.get({ guildId });

    if (guildRow) throw new Error("You have already setup in this server");

    createGuildRow.run({ guildId });

    await interaction.editReply("Successfully setup!");
  },
} satisfies extendedAPICommand;
