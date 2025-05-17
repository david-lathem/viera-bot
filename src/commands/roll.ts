import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";

import db from "../database/index.js";
import { extendedAPICommand, KaosItem } from "../utils/typings/types.js";
import path from "path";
import { removeRoleWhenTicketZero } from "../utils/misc.js";
import { getAllKaosItem, getGuildById } from "../database/queries.js";

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

    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const serverNumber = interaction.options.getString("server_number", true);

    const guildSettings = getGuildById.get({ guildId });

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

    const kaosItems = getAllKaosItem.all({ guildId });

    if (!kaosItems.length)
      throw new Error("No kaos item added yet! Ask admins to add one");

    const userData = db
      .prepare<{}, { tickets: number }>(
        "SELECT tickets FROM users WHERE userId = ?"
      )
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

    const rolledItem = rollItem(kaosItems);

    const rollDuration = 1000 * 7; // In seconds rolling effect
    const rollInterval = 1000; // Change item every 500ms
    const steps = Math.round(rollDuration / rollInterval); // Number of steps in rolling
    let currentStep = 0;

    console.log(steps);
    const updateEmbed = async () => {
      try {
        if (currentStep < steps) {
          console.log(currentStep);

          const randomItem =
            kaosItems[Math.floor(Math.random() * kaosItems.length)];

          const rollingEmbed = new EmbedBuilder()
            .setTitle("🎲 Rolling... 🎲")
            .setColor(0x7316de)

            // .setImage(`attachment://${randomItem.kaosId}.webp`)
            .setImage(
              `${process.env.KAOS_ITEM_IMG_BASE_URL}?image=${randomItem.kaosId}`
            )
            .setFooter({ text: "Rolling..." });

          const data = {
            embeds: [rollingEmbed],
            // files: [path.join("assets", randomItem.kaosId + ".webp")],
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

            .setImage(
              `${process.env.KAOS_ITEM_IMG_BASE_URL}?image=${rolledItem.kaosId}`
            )
            // .setImage(`attachment://${rolledItem.kaosId}.webp`)
            .setFooter({ text: `Tickets remaning: ${userData.tickets - 1}` });

          await interaction.editReply({
            files: [
              // path.join("assets", rolledItem.kaosId + ".webp"),
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

          if (randomIndex === 1 && rolledItem["threeXWin"]) {
            //  0 or 1 since sqlite doesnt have boolean
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

function rollItem(lootTable: KaosItem[]): KaosItem {
  const weightedList = lootTable.flatMap((item) =>
    Array(item.odds).fill(item.name)
  );

  const randomIndex = Math.floor(Math.random() * weightedList.length);
  const winner = weightedList[randomIndex];

  return lootTable.find((t) => t.name === winner)!;
}
