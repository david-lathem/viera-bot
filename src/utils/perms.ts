import { Guild, GuildMember, PermissionFlagsBits } from "discord.js";

export const isAdmin = (member: GuildMember) => {
  if (!member.permissions.has(PermissionFlagsBits.Administrator))
    throw new Error("Admin only!");
};

export const isAuthorizedServer = (guild: Guild) => {
  if (guild.id !== process.env.GUILD_ID)
    throw new Error("Must be ran within authorized server only!");
};

export const isBotOwner = (member: GuildMember) => {
  if(member.id !== process.env.BOT_OWNER_ID) throw new Error('Only bot owner can run this command!')
}