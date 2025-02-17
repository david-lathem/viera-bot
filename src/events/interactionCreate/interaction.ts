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

    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.find(
        (c) => c.name === interaction.commandName
      );

      if (!command?.autocomplete) return;

      let response = await command.autocomplete(interaction);

      response = response.slice(0, 25);

      await interaction.respond(
        response.map((r) => (typeof r === "string" ? { name: r, value: r } : r))
      );
    }
  } catch (error) {
    console.log(error);
  }
};
