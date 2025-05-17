import dotenv from "dotenv";
import path from "node:path";

const __dirname = import.meta.dirname;

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// had to put this import in client.ts not index.ts becaause the code wont be processed since imports are handled frist
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
