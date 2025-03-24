import { GuildMember, PermissionFlagsBits } from "discord.js";

export const isAdmin = (member: GuildMember) => {
  if (!member.permissions.has(PermissionFlagsBits.Administrator))
    throw new Error("Admin only!");
};
