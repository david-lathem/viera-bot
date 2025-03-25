import { GuildMember } from "discord.js";

export const removeRoleWhenTicketZero = async (
  member: GuildMember,
  tickets: number
) => {
  console.log(tickets);
  if (tickets > 0) return;

  const ticketRoleRegex = /^\d+\s+tickets$/i;

  const newRoles = member.roles.cache
    .filter((role) => !ticketRoleRegex.test(role.name))
    .map((role) => role.id);

  console.log(newRoles);

  await member.roles.set(newRoles);
};
