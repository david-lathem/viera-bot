import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import {
  resetRaceConfig,
  updateRaceConfigCurrency,
  updateRaceConfigReward,
} from "../database/queries.js";
import { getGuildRowThrowErrIfNot } from "../utils/database.js";
import { isAdmin } from "../utils/perms.js";
import { formatRaceConfigDisplay } from "../utils/misc.js";

export default {
  name: "race_config",
  description: "Configure race rewards",
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "view",
      description: "Shows current configuration",
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "currency",
      description:
        "Change the name of the currency (e.g., scrap, percs, points)",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "name",
          description: "Name of the currency",
          required: true,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "reward",
      description: "Set the reward for a specific position (1–5)",
      options: [
        {
          type: ApplicationCommandOptionType.Integer,
          name: "position",
          description: "Position (1 to 5)",
          required: true,
          min_value: 1,
          max_value: 5,
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: "points",
          description: "Reward amount",
          required: true,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "reset",
      description: "Resets the configuration to default values",
    },
  ],
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply();

    const subcommand = interaction.options.getSubcommand();
    const { member, guildId } = interaction;

    const guildRow = getGuildRowThrowErrIfNot(guildId);

    if (subcommand === "view") {
      const response = formatRaceConfigDisplay(guildRow.raceConfig);
      await interaction.editReply(response);
    }

    isAdmin(member);

    if (subcommand === "currency") {
      const currency = interaction.options.getString("name", true);
      updateRaceConfigCurrency.run({ guildId, currency });

      return await interaction.editReply(`✅ Currency set to **${currency}**`);
    }

    if (subcommand === "reward") {
      const position = interaction.options.getInteger("position", true);
      const points = interaction.options.getInteger("points", true);

      const i = guildRow.raceConfig.rewards.findIndex(
        (r) => r.position === position
      );

      updateRaceConfigReward.run({
        guildId,
        points,
        path: `$.rewards[${i}].points`,
      });

      return await interaction.editReply(
        `✅ Reward for position ${position} set to ${points}`
      );
    }

    if (subcommand === "reset") {
      resetRaceConfig.run({ guildId });

      return await interaction.editReply(
        "🔁 Race configuration has been reset to defaults."
      );
    }
  },
} satisfies extendedAPICommand;
