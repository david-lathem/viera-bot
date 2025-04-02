import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";

import db from "../database/index.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import raceData from "./../../race.json" with { type: "json" };
import { isAuthorizedServer } from "../utils/perms.js";

interface Boat {
  id: 1 | 2 | 3 | 4 | 5;
  progress: number;
  finished: boolean;
  place: number;
}

const colorMap = {
  1: "🔴",
  2: "🔵",
  3: "🟢",
  4: "🟡",
  5: "🟣",
};

const colorMapName = {
  1: "RED",
  2: "BLUE",
  3: "GREEN",
  4: "YELLOW",
  5: "PURPLE",
};

export default {
  name: "race",
  description: "Race using rhibs! Takes one ticket!",

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
    {
      name: "rhib",
      description: "Choose a your rhib.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      choices: Array.from({ length: 5 }, (_, i) => ({
        name: colorMapName[(i + 1) as 1 | 2 | 3 | 4 | 5] + " RHIB",
        value: i + 1,
      })),
    },
  ],
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    isAuthorizedServer(interaction.guild);

    const { user, guildId } = interaction;

    const userId = user.id;

    const serverNumber = interaction.options.getString("server_number", true);
    const rhib = interaction.options.getInteger("rhib", true);

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
        content: "You do not have enough tickets to race !",
      });
    }

    db.prepare("UPDATE users SET tickets = tickets - 1 WHERE userId = ?").run(
      userId
    );

    await interaction.reply("🏁 Race starting in 3...");
    await new Promise((res) => setTimeout(res, 500));
    await interaction.editReply("🏁 Race starting in 2...");
    await new Promise((res) => setTimeout(res, 500));
    await interaction.editReply("🏁 Race starting in 1...");
    await new Promise((res) => setTimeout(res, 500));
    await interaction.editReply("🏁 Go! 🚀");

    const raceTrack: Array<Boat> = Array.from({ length: 5 }, (_, i) => ({
      id: (i + 1) as 1 | 2 | 3 | 4 | 5,
      progress: 0,
      finished: false,
      place: 0,
    }));

    const finishLine = 10;
    let finishedCount = 0;

    const userRandomPos = getRandomWin();

    console.log(userRandomPos);

    while (finishedCount < 5) {
      // Randomly assign progress
      raceTrack.forEach((boat) => {
        if (boat.finished) return;

        const userBot = boat.id === rhib;

        const randProgress = Math.floor(Math.random() * 4) || 1; // Moves 0-3 spaces

        const isWin = finishedCount + 1 === userRandomPos.position;

        const hasBoatFinishedLine = randProgress + boat.progress >= finishLine;
        // if (randProgress + boat.progress < finishLine)
        //

        if (hasBoatFinishedLine) {
          if (userBot && !isWin) {
            // console.log("user bot yippe");
            return;
          }

          if (!userBot && isWin) {
            // console.log("no user but win");
            return;
          }
        }

        if (!hasBoatFinishedLine) {
          return (boat.progress += randProgress);
        }

        boat.finished = true;
        boat.progress = finishLine;
        boat.place = ++finishedCount;
      });

      //   console.log(raceTrack);
      //   console.log("----------------");

      // Update race message
      const raceStatus = raceTrack
        .map(
          (boat) =>
            `${colorMap[boat.id]}: ${"🌊".repeat(boat.progress)}<:5555~1:> ${
              boat.finished ? `🏁 (Place: ${boat.place})` : ""
            }`
        )
        .join("\n");

      await interaction.editReply(`🏁 **Race Update:**\n${raceStatus}`);
      await new Promise((res) => setTimeout(res, 1500));
    }

    const userFinish = raceTrack.find((boat) => boat.id === rhib);
    const won = userFinish!.place === 1;

    await interaction.followUp(
      `🎉 **RHIB ${userFinish!.id} finished in position ${userFinish!.place}! ${
        won ? "🏆 You won!" : "😢 Better luck next time!"
      }**\n**__Thanks for playing KING's Race.__** **Tickets left: ${userData.tickets - 1}**`
    );
    await channel.send({
      content: `[KAOS][ADD][<@${interaction.user.id}>][${serverNumber}]=[POINTS][${userRandomPos.quantity}]`,
    });
  },
} satisfies extendedAPICommand;

function getRandomWin() {
  const weightedList = raceData.flatMap((item) =>
    Array(item.odds).fill(item.position)
  );

  const randomIndex = Math.floor(Math.random() * weightedList.length);
  const winner = weightedList[randomIndex];

  return raceData.find((t) => t.position === winner)!;
}
