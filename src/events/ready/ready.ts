import { Client } from "discord.js";

import registerAndAttachCommandsOnClient from "../../utils/registrars/registerCommands.js";

export default async (client: Client<true>) => {
  console.log(`${client.user.username} (${client.user.id}) is ready 🐬`);

  for (const guild of [...client.guilds.cache.values()]) {
    const members = await guild.members.fetch().catch(console.log);

    console.log(
      `Fetched ${members?.size ?? 0} members for ${guild?.name} (${guild?.id})`
    );
  }

  await registerAndAttachCommandsOnClient(client);
};
