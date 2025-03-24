import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";

import db from "../database/index.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import config from "./../../config.json" with { type: "json" };
import path from "path";

interface LootItem {
  name: string;
  kaosId: string;
  quantity: number;
  odds: number;
  "3xWin": boolean;
  type: string;
}

export default {
  name: "roll",
  description: "Roll for a random item using your tickets.",

  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    if (!interaction.guildId) {
      return await interaction.reply(
        "This command can only be used in a server."
      );
    }

    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const guildSettings = db
      .prepare<
        {},
        { guildId: string; kaosCommandChannelId: string }
      >("SELECT kaosCommandChannelId FROM guildSettings WHERE guildId = ?")
      .get(guildId);

    if (!guildSettings || !guildSettings.kaosCommandChannelId) {
      return await interaction.reply({
        content:
          "This server has not set a Kaos command channel. Use `/setkaoschannel` first!",
      });
    }

    const channelId = guildSettings.kaosCommandChannelId;
    const channel = interaction.guild.channels.cache.get(
      channelId
    ) as TextChannel;

    if (!channel) {
      return await interaction.reply({
        content: "The configured Kaos command channel no longer exists.",
      });
    }

    const userData = db
      .prepare<
        {},
        { tickets: number }
      >("SELECT tickets FROM users WHERE userId = ?")
      .get(userId);

    if (!userData || userData.tickets < 1) {
      return await interaction.reply({
        content: "You do not have enough tickets to roll!",
      });
    }

    db.prepare("UPDATE users SET tickets = tickets - 1 WHERE userId = ?").run(
      userId
    );

    const rolledItem = rollItem(config);
    const embed = new EmbedBuilder()
      .setTitle("🎲 Roll Results! 🎲")
      .setColor(0x7316de)
      .addFields([
        { name: "🛠 Item", value: rolledItem.name, inline: true },
        {
          name: "📦 Quantity",
          value: String(rolledItem.quantity),
          inline: true,
        },
      ])
      .setImage(`attachment://${rolledItem.kaosId}.webp`)
      .setFooter({ text: `Tickets: ${userData.tickets - 1}` });

    const typeStr = rolledItem.type === "ITEM" ? `[${rolledItem.kaosId}]` : "";
    const quantity = rolledItem.type === "ITEM" ? rolledItem.quantity : 5000000;

    await channel.send({
      content: `[KAOS][ADD][<@${interaction.user.id}>][ALL]=[${rolledItem.type}]${typeStr}[${quantity}]`,
    });

    await interaction.reply({
      embeds: [embed],
      files: [path.join("assets", rolledItem.kaosId + ".webp")],
    });
  },
} satisfies extendedAPICommand;

function rollItem(lootTable: LootItem[]): LootItem {
  const weightedList = lootTable.flatMap((item) =>
    Array(item.odds).fill(item.name)
  );
  console.log(weightedList);

  const randomIndex = Math.floor(Math.random() * weightedList.length);
  console.log(randomIndex);
  console.log(weightedList[randomIndex]);

  const winner = weightedList[randomIndex];

  return lootTable.find((t) => t.name === winner)!;
}
