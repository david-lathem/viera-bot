import db from "../database/index.js";
import { isAdmin } from "../utils/perms.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  User,
} from "discord.js";

interface UserData {
  userId: string;
  tickets: number;
}

export default {
  name: "tickets",
  description: "Manage user tickets.",
  guildOnly: true,
  options: [
    {
      name: "view",
      description: "View a user's ticket count.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The user to check",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
    {
      name: "add",
      description: "Add tickets to a user.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The user to add tickets to",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "Number of tickets to add",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Remove tickets from a user.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The user to remove tickets from",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "Number of tickets to remove",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    },
    {
      name: "transfer",
      description: "Transfer tickets to another user.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "to",
          description: "The user to transfer tickets to",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "amount",
          description: "Number of tickets to transfer",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    },
    {
      name: "leaderboards",
      description: "View the top users with the most tickets.",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user");
    const recipient = interaction.options.getUser("to");
    const amount = interaction.options.getInteger("amount");

    if (subcommand !== "view" && subcommand !== "leaderboards")
      isAdmin(interaction.member);

    if (subcommand === "view" && user) {
      const userData = db
        .prepare<
          {
            userId: string;
          },
          UserData
        >("SELECT tickets FROM users WHERE userId = @userId")
        .get({ userId: user.id });

      return await interaction.reply(
        `${user.username} has ${userData?.tickets ?? 0} tickets.`
      );
    }

    if (subcommand === "add" && user) {
      db.prepare(
        "INSERT INTO users (userId, tickets) VALUES (?, ?) ON CONFLICT(userId) DO UPDATE SET tickets = tickets + ?"
      ).run(user.id, amount, amount);

      return await interaction.reply(
        `Added ${amount} tickets to ${user.username}.`
      );
    }

    if (subcommand === "remove" && user) {
      db.prepare("UPDATE users SET tickets = tickets - ? WHERE userId = ?").run(
        amount,
        user.id
      );

      return await interaction.reply(
        `Removed ${amount} tickets from ${user.username}.`
      );
    }
    if (subcommand === "transfer" && recipient && amount) {
      const senderId = interaction.user.id;

      const senderData = db
        .prepare<{}, UserData>("SELECT tickets FROM users WHERE userId = ?")
        .get(senderId);

      if (!senderData || senderData.tickets < amount) {
        return await interaction.reply(
          "You don't have enough tickets to transfer."
        );
      }

      const transaction = db.transaction(() => {
        db.prepare(
          "UPDATE users SET tickets = tickets - ? WHERE userId = ?"
        ).run(amount, senderId);
        db.prepare(
          "INSERT INTO users (userId, tickets) VALUES (?, ?) ON CONFLICT(userId) DO UPDATE SET tickets = tickets + ?"
        ).run(recipient.id, amount, amount);
      });

      transaction();

      return await interaction.reply(
        `Transferred ${amount} tickets to ${recipient.username}.`
      );
    }

    if (subcommand === "leaderboards") {
      const topUsers = db
        .prepare<
          {},
          UserData
        >("SELECT userId, tickets FROM users ORDER BY tickets DESC")
        .all({});

      if (topUsers.length === 0) {
        return await interaction.reply("No users have tickets yet.");
      }

      const leaderboard = topUsers
        .map((u, i) => `${i + 1}. <@${u.userId}> : ${u.tickets} tickets`)
        .join("\n");

      return await interaction.reply(`**Ticket Leaderboard:**\n${leaderboard}`);
    }
  },
} satisfies extendedAPICommand;
