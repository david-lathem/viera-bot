import {
    ChatInputCommandInteraction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder,
    ModalActionRowComponentBuilder,
  } from "discord.js";
  
  import { extendedAPICommand } from "../utils/typings/types.js";
  
  export default {
    name: "kit",
    description: "Genera un kit aleatorio",
    guildOnly: true,
    execute: async (interaction: ChatInputCommandInteraction) => {
        try{
        const modal = new ModalBuilder()
        .setCustomId('kitName_modal')
        .setTitle('Kit name')
        .addComponents(
          new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId('kit_name')
              .setLabel('Kit name')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue('')
          )
        );
        await interaction.showModal(modal);
    }catch(e){
        console.log(e);
    }
    },
  } satisfies extendedAPICommand;
  