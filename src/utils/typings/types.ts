import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  PermissionFlags,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

export interface extendedAPICommand
  extends RESTPostAPIChatInputApplicationCommandsJSONBody {
  permissionRequired?: PermissionFlags | Array<PermissionFlags>;
  guildOnly?: Boolean;
  autocomplete?(
    interaction: AutocompleteInteraction
  ): Promise<Array<ApplicationCommandOptionChoiceData> | Array<string>>;
  execute(interaction: ChatInputCommandInteraction): Promise<any>;
}
