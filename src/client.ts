import { Client, GatewayIntentBits, Partials } from "discord.js";

import registerEventsOnClient from "./utils/registrars/registerEvents.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.GuildMember],
});

client.commands = [];

client.rest.on("rateLimited", console.log);

await registerEventsOnClient(client);

client.login(process.env.TOKEN);

export default client;
