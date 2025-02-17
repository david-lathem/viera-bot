import { BaseInteraction } from "discord.js";

export default async (interaction: BaseInteraction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.find(
        (c) => c.name === interaction.commandName
      );

      if (!command?.execute)
        return await interaction.reply("Command is not setup yet!");

      await command.execute(interaction);
    }
  } catch (error) {
    console.log(error);
  }
};
