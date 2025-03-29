import { Message } from "discord.js";
import db from "../../database/index.js";

interface UserData {
  userId: string;
  tickets: number;
}

export default async (message: Message) => {
  try {
    if (!message.inGuild()) return;

    const { author, client, guild, channelId, content } = message;

    if (author.id === client.user.id) return;

    const data = db
      .prepare<
        string,
        { guildId: string; ticketChannelId?: string }
      >(`SELECT * FROM guildSettings WHERE guildId = ?`)
      .get(guild.id);

    if (!data || !data.ticketChannelId) return;

    if (channelId !== data.ticketChannelId) return;

    const regex = /\[ADD\]\[\<@([^>]+)\>\]\[TICKETS\]\[(\d+)\]/;

    console.log(content);

    const match = content.match(regex);

    console.log(match);

    if (!match)
      return console.log("Message sent in ticket channel but no regex match!");

    const discordId = match[1];
    const tickets = parseInt(match[2], 10);

    db.prepare(
      "INSERT INTO users (userId, tickets) VALUES (?, ?) ON CONFLICT(userId) DO UPDATE SET tickets = tickets + ?"
    ).run(discordId, tickets, tickets);

    const userData = db
      .prepare<
        {
          userId: string;
        },
        UserData
      >("SELECT tickets FROM users WHERE userId = @userId")
      .get({ userId: discordId });

    await message.reply(
      `Added 25 tickets to <@${discordId}>\nCurrent tickets: ${userData?.tickets}`
    );
  } catch (error) {
    console.log(error);
  }
};
