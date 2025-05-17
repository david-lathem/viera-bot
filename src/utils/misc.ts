import { GuildMember } from "discord.js";
import { RaceConfig } from "./typings/types.js";

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

export function formatRaceConfigDisplay(config: RaceConfig): string {
  const { currency, rewards } = config;

  const rewardLines = rewards
    .sort((a, b) => a.position - b.position)
    .map(({ position, points }) => {
      const suffix =
        position === 1
          ? "st"
          : position === 2
          ? "nd"
          : position === 3
          ? "rd"
          : "th";
      return `**${position}${suffix}:** ${points} ${currency}`;
    });

  return `**Currency:** ${currency}\n\n**Rewards:**\n${rewardLines.join("\n")}`;
}
