import { extendedAPICommand } from "../../utils/typings/types.js";

export default {
  name: "ban",
  description: "Ban someone",
  execute: async (interaction) => {
    await interaction.reply("nuh uh");
  },
} satisfies extendedAPICommand;
