import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import {
  extendedAPICommand,
  KaosItem,
  KaosItemType,
} from "../utils/typings/types.js";
import {
  deleteKaosItem,
  getAllKaosItem,
  getKaosItem,
  insertKaosItem,
} from "../database/queries.js";
import { getGuildRowThrowErrIfNot } from "../utils/database.js";

export default {
  name: "items",
  description: "Manage items for the roll system",
  permissionRequired: PermissionFlagsBits.Administrator,
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "list",
      description: "Displays all available items",
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "add",
      description: "Adds a new item",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "name",
          description: "The display name of the item",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "kaos_id",
          description: "The internal Kaos ID used to reference the item",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: "quantity",
          description: "How many of the item are given when rolled",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: "odds",
          description: "The chance of this item being rolled (in percent)",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "type",
          description: "The category of the item",
          required: true,
          choices: [
            { name: "KIT", value: "KIT" },
            { name: "ITEM", value: "ITEM" },
          ],
        },
        {
          type: ApplicationCommandOptionType.Boolean,
          name: "win3x_mode",
          description: "Should it have 3x win mode enabled",
          required: true,
        },
      ],
    },

    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "remove",
      description: "Removes an item by its kaos_id",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "kaos_id",
          description: "the kaos id",
          required: true,
        },
      ],
    },
  ],
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply();

    const sub = interaction.options.getSubcommand();
    const { guildId } = interaction;

    getGuildRowThrowErrIfNot(guildId); // just to make sure user has ran install

    if (sub === "list") {
      const items = getAllKaosItem.all({ guildId });
      if (items.length === 0) return interaction.editReply("No items found.");

      return interaction.editReply(
        `🎲 **Items List:**\n\n` +
          items
            .map((i: KaosItem) => {
              console.log(i.threeXWin);

              return `• **${i.name}** (\`${i.kaosId}\`) - Qty: ${
                i.quantity
              }, Odds: ${i.odds}%, Type: ${i.type}, 3x: ${
                i.threeXWin ? "✅" : "❌"
              }`;
            })
            .join("\n")
      );
    }

    if (sub === "add") {
      const name = interaction.options.getString("name", true);
      const kaosId = interaction.options.getString("kaos_id", true);
      const quantity = interaction.options.getInteger("quantity", true);
      const odds = interaction.options.getInteger("odds", true);
      const type = interaction.options.getString("type", true) as KaosItemType;
      const threeXWin = interaction.options.getBoolean("win3x_mode", true);

      console.log(threeXWin);

      const existing = getKaosItem.get({ guildId, kaosId });

      if (existing)
        return interaction.editReply("Item with that ID already exists.");

      insertKaosItem.run({
        guildId,
        name,
        kaosId,
        quantity,
        odds,
        type,
        threeXWin: threeXWin ? 1 : 0,
      });

      return interaction.editReply(`✅ Item **${name}** added.`);
    }

    if (sub === "remove") {
      const kaosId = interaction.options.getString("kaos_id", true);
      const result = deleteKaosItem.run({ guildId, kaosId });

      if (result.changes === 0)
        return interaction.editReply("❌ No such item found.");

      return interaction.editReply(`🗑️ Item \`${kaosId}\` removed.`);
    }
  },
} satisfies extendedAPICommand;
