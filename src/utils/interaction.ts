import { BaseInteraction, MessageFlags } from "discord.js";

export const handleInteractionError = async (
  interaction: BaseInteraction,
  error: Error
) => {
  console.log(error);

  if (!interaction.isChatInputCommand() && !interaction.isMessageComponent())
    return;

  const content = `Err! \`${error.message}\``;

  try {
    if (interaction.deferred || interaction.replied)
      await interaction.editReply(content);
    else await interaction.reply({ content, flags: MessageFlags.Ephemeral });
  } catch (error) {
    console.log(error);
  }
};
