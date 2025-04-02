import db from "../database/index.js";
import { removeRoleWhenTicketZero } from "../utils/misc.js";
import { isAdmin, isAuthorizedServer } from "../utils/perms.js";
import { extendedAPICommand } from "../utils/typings/types.js";
import {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  User,
  time,
  TimestampStyles,
} from "discord.js";

interface UserData {
  userId: string;
  tickets: number;
  lastDailyClaimedTimestamp: null | number;
}

export default {
  name: "tickets",
  description: "Manage user tickets.",
  guildOnly: true,
  options: [
    {
      name: "daily",
      description: "Claim your daily ticket",
      type: ApplicationCommandOptionType.Subcommand,
    },
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

    isAuthorizedServer(interaction.guild);

    if (
      subcommand !== "view" &&
      subcommand !== "leaderboards" &&
      subcommand !== "transfer" &&
      subcommand !== "daily"
    )
      isAdmin(interaction.member);

    if (subcommand === "daily") {
      const { user } = interaction;
      const userData = db
        .prepare<
          {
            userId: string;
          },
          UserData
        >("SELECT * FROM users WHERE userId = @userId")
        .get({ userId: user.id });

      const curDate = Date.now();

      const dayInMs = 24 * 60 * 60 * 1000;
      if (
        userData?.lastDailyClaimedTimestamp &&
        userData.lastDailyClaimedTimestamp + dayInMs > curDate
      ) {
        return await interaction.reply(
          `You have already claimed your daily ticket. Next claim at ${time(new Date(userData.lastDailyClaimedTimestamp + dayInMs), TimestampStyles.ShortDateTime)}`
        );
      }

      db.prepare(
        "INSERT INTO users (userId, tickets, lastDailyClaimedTimestamp) VALUES (?, 1,  ?) ON CONFLICT(userId) DO UPDATE SET tickets = tickets + 1 , lastDailyClaimedTimestamp = ?"
      ).run(user.id, curDate, curDate);

      return await interaction.reply(
        `You now have ${userData?.tickets! + 1} tickets. Next claim at ${time(new Date(curDate + dayInMs), TimestampStyles.ShortDateTime)}`
      );
    }

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

    if (subcommand === "remove" && user && amount) {
      const senderId = interaction.user.id;

      db.prepare("UPDATE users SET tickets = tickets - ? WHERE userId = ?").run(
        amount,
        user.id
      );

      const senderData = db
        .prepare<{}, UserData>("SELECT tickets FROM users WHERE userId = ?")
        .get(senderId);

      await removeRoleWhenTicketZero(interaction.member, senderData!.tickets);

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

      await removeRoleWhenTicketZero(
        interaction.member,
        senderData.tickets - amount
      );

      return await interaction.reply(
        `Transferred ${amount} tickets to ${recipient.username}.`
      );
    }

    if (subcommand === "leaderboards") {
      const topUsers = db
        .prepare<
          {},
          UserData
        >("SELECT userId, tickets FROM users WHERE tickets > 0 ORDER BY tickets DESC")
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
