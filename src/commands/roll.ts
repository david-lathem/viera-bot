import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";

import db from "../database/index.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import config from "./../../config.json" with { type: "json" };
import path from "path";
import { isAuthorizedServer } from "../utils/perms.js";
import { removeRoleWhenTicketZero } from "../utils/misc.js";

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

  options: [
    {
      name: "server_number",
      description: "Choose a server number (1-13).",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: Array.from({ length: 13 }, (_, i) => ({
        name: (i + 1).toString(),
        value: i + 1 + "",
      })),
    },
  ],
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    isAuthorizedServer(interaction.guild);

    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const serverNumber = interaction.options.getString("server_number", true);

    const guildSettings = db
      .prepare<
        {},
        {
          guildId: string;
          kaosCommandChannelId?: string;
        }
      >("SELECT * FROM guildSettings WHERE guildId = ?")
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

    await removeRoleWhenTicketZero(interaction.member, userData.tickets - 1);
    const rolledItem = rollItem(config);

    const rollDuration = 1000 * 7; // In seconds rolling effect
    const rollInterval = 1000; // Change item every 500ms
    const steps = Math.round(rollDuration / rollInterval); // Number of steps in rolling
    let currentStep = 0;

    console.log(steps);
    const updateEmbed = async () => {
      try {
        if (currentStep < steps) {
          console.log(currentStep);

          const randomItem = config[Math.floor(Math.random() * config.length)];

          const rollingEmbed = new EmbedBuilder()
            .setTitle("🎲 Rolling... 🎲")
            .setColor(0x7316de)

            .setImage(`attachment://${randomItem.kaosId}.webp`)
            .setFooter({ text: "Rolling..." });

          const data = {
            embeds: [rollingEmbed],
            files: [path.join("assets", randomItem.kaosId + ".webp")],
          };

          if (!interaction.replied) await interaction.reply(data);
          else await interaction.editReply(data);

          currentStep++;

          console.log(randomItem.name);

          setTimeout(updateEmbed, rollInterval);
        } else {
          console.log("ehh");

          // Final item display
          const finalEmbed = new EmbedBuilder()
            .setTitle(
              rolledItem.kaosId !== "charcoal"
                ? "🎉 You won! 🎉"
                : "You lost 😥"
            )
            .setColor(rolledItem.kaosId !== "charcoal" ? 0x00ff00 : "Red")
            .addFields([
              { name: "🛠 Item", value: rolledItem.name, inline: true },
              {
                name: "📦 Quantity",
                value: String(rolledItem.quantity),
                inline: true,
              },
            ])

            .setThumbnail(`attachment://embed_thumbnail.webp`)

            .setImage(`attachment://${rolledItem.kaosId}.webp`)
            .setFooter({ text: `Tickets remaning: ${userData.tickets - 1}` });

          await interaction.editReply({
            files: [
              path.join("assets", rolledItem.kaosId + ".webp"),
              path.join("assets", "embed_thumbnail" + ".webp"),
            ],
            embeds: [finalEmbed],
          });

          const odds = Array(1000 * 100).fill(0);

          const randomIndex = Math.floor(Math.random() * odds.length);

          const isNotHiroshima =
            rolledItem.type === "ITEM" || rolledItem.type === "KIT";

          const typeStr = isNotHiroshima ? `[${rolledItem.kaosId}]` : "";
          let quantity = isNotHiroshima ? rolledItem.quantity : 5000000;

          if (randomIndex === 1 && rolledItem["3xWin"] === true) {
            quantity *= 3;
          }

          await channel.send({
            content: `[KAOS][ADD][<@${interaction.user.id}>][${serverNumber}]=[${rolledItem.type}]${typeStr}[${quantity}]`,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    updateEmbed();
  },
} satisfies extendedAPICommand;

function rollItem(lootTable: LootItem[]): LootItem {
  const weightedList = lootTable.flatMap((item) =>
    Array(item.odds).fill(item.name)
  );

  const randomIndex = Math.floor(Math.random() * weightedList.length);
  const winner = weightedList[randomIndex];

  return lootTable.find((t) => t.name === winner)!;
}
