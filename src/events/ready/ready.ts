import { Client } from "discord.js";

import registerAndAttachCommandsOnClient from "../../utils/registrars/registerCommands.js";

export default async (client: Client<true>) => {
  console.log(`${client.user.username} (${client.user.id}) is ready 🐬`);

  const guild = client.guilds.cache.get(process.env.GUILD_ID!);

  await guild?.members.fetch().catch(console.log);

  await registerAndAttachCommandsOnClient(client);
};
