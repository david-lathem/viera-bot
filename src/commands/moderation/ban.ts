import { extendedAPICommand } from "../../utils/typings/types.js";

export default {
  name: "ban",
  description: "Ban someone",
  options: [
    {
      type: 3,
      description: "user id to ban",
      name: "user",
      autocomplete: true,
    },
  ],
  autocomplete: async (interaction) => {
    return [];
  },
  execute: async (interaction) => {
    await interaction.reply("nuh uh");
  },
} satisfies extendedAPICommand;
