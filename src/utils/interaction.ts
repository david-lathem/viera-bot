import {
  BaseInteraction,
  ChatInputCommandInteraction,
  InteractionEditReplyOptions,
  InteractionReplyOptions,
  MessageComponentInteraction,
  MessageFlags,
} from "discord.js";

export const replyOrEditInteraction = async (
  interaction: ChatInputCommandInteraction | MessageComponentInteraction,
  reply: InteractionReplyOptions | InteractionEditReplyOptions
) => {
  try {
    if (interaction.replied || interaction.deferred)
      await interaction.editReply(reply as InteractionEditReplyOptions);
    else await interaction.reply(reply as InteractionReplyOptions);
  } catch (error) {
    console.log(error);
  }
};

export const handleInteractionError = async (
  interaction: BaseInteraction,
  error: Error
) => {
  console.log(error);

  if (!interaction.isChatInputCommand() || !interaction.isMessageComponent())
    return;

  const content = `Err! \`${error.message}\``;

  await replyOrEditInteraction(interaction, {
    content,
    flags: MessageFlags.Ephemeral,
  });
};
