import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import { deleteGuildRow, getlAllGuilds } from "../database/queries.js";
import { getGuildRowThrowErrIfNot } from "../utils/database.js";
import { formatRaceConfigDisplay } from "../utils/misc.js";
import { isBotOwner } from "../utils/perms.js";

export default {
  name: "servers",
  description: "Manage and view server information",
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "list",
      description: "Shows all configured servers",
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "info",
      description: "Shows detailed information about a server",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "server",
          description: "Guild ID of the server",
          required: true,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "clean",
      description: "Removes data from unknown servers",
    },
  ],
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply();

    const { client, member } = interaction;

    isBotOwner(member);

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "list") {
      const allGuilds = getlAllGuilds.all({});

      if (allGuilds.length === 0) throw new Error("No server setup so far");
      const lines = allGuilds.map(({ guildId }) => {
        const name =
          client.guilds.cache.get(guildId)?.name ?? "*Unknown guild*";
        return `• \`${guildId}\` - ${name}`;
      });

      return await interaction.editReply(
        `📋 **Configured Servers:**\n\n${lines.join("\n")}`
      );
    }

    if (subcommand === "info") {
      const guildId = interaction.options.getString("server", true);
      const row = getGuildRowThrowErrIfNot(guildId);

      const name = client.guilds.cache.get(guildId)?.name ?? "*Unknown guild*";
      const display = formatRaceConfigDisplay(row.raceConfig);

      return await interaction.editReply(
        `📄 **Info for:** \`${guildId}\` (${name})\n\n${display}`
      );
    }

    if (subcommand === "clean") {
      const allGuilds = getlAllGuilds.all({});

      const removed = [];

      for (const { guildId } of allGuilds) {
        if (!client.guilds.cache.has(guildId)) {
          deleteGuildRow.run({ guildId });
          removed.push(guildId);
        }
      }

      const content = removed.length
        ? `🧹 Removed data for ${removed.length} unknown server(s):\n${removed
            .map((id) => `• \`${id}\``)
            .join("\n")}`
        : "✅ No unknown servers found. All good!";

      return await interaction.editReply(content);
    }
  },
} satisfies extendedAPICommand;
