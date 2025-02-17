import { Client } from "discord.js";

import registerAndAttachCommandsOnClient from "../../utils/registrars/registerCommands.js";

export default async (client: Client<true>) => {
  console.log(`${client.user.username} (${client.user.id}) is ready 🐬`);
  await registerAndAttachCommandsOnClient(client);
};
