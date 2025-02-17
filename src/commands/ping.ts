import { extendedAPICommand } from "../utils/typings/types.js";

export default {
  name: "ping",
  description: "Ping Pong!",
  execute: async (interaction) => {
    await interaction.reply("Pong!");
  },
} satisfies extendedAPICommand;
