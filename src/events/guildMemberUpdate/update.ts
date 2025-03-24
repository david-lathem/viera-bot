import { GuildMember, Role } from "discord.js";
import db from "../../database/index.js";

export default async (oldMember: GuildMember, updatedMember: GuildMember) => {
  try {
    if (oldMember.partial)
      return console.log(`${oldMember} was not in cache when updating!`);

    const oldRoles = new Set(oldMember.roles.cache.keys());
    const newRoles = new Set(updatedMember.roles.cache.keys());

    const addedRoles = [...newRoles].filter((roleId) => !oldRoles.has(roleId));
    const removedRoles = [...oldRoles].filter(
      (roleId) => !newRoles.has(roleId)
    );

    console.log({ addedRoles, removedRoles });

    let totalTicketsAdded = 0;
    let totalTicketsRemoved = 0;

    const parseTicketAmount = (role: Role) => {
      const match = role.name.match(/^(\d+)\s*tickets$/i);
      return match ? parseInt(match[1], 10) : null;
    };

    for (const roleId of addedRoles) {
      const role = updatedMember.guild.roles.cache.get(roleId);
      if (!role) continue;
      const ticketAmount = parseTicketAmount(role);
      if (ticketAmount) totalTicketsAdded += ticketAmount;
    }

    for (const roleId of removedRoles) {
      const role = updatedMember.guild.roles.cache.get(roleId);
      if (!role) continue;
      const ticketAmount = parseTicketAmount(role);
      if (ticketAmount) totalTicketsRemoved += ticketAmount;
    }

    if (totalTicketsAdded > 0 || totalTicketsRemoved > 0) {
      const userId = updatedMember.id;
      db.prepare(
        `INSERT INTO users (userId, tickets) VALUES (?, ?) 
        ON CONFLICT(userId) DO UPDATE SET tickets = tickets + ?`
      ).run(userId, totalTicketsAdded, totalTicketsAdded - totalTicketsRemoved);

      console.log(
        `Updated ${updatedMember.user.username}: +${totalTicketsAdded} -${totalTicketsRemoved} tickets`
      );
    }
  } catch (error) {
    console.log(error);
  }
};
