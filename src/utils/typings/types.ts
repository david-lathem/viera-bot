import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  PermissionFlags,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

interface autoCompleteData {
  name: string;
  value: string;
}
export interface extendedAPICommand
  extends RESTPostAPIChatInputApplicationCommandsJSONBody {
  permissionRequired?: PermissionFlags | Array<PermissionFlags>;
  guildOnly?: Boolean;
  autocomplete?(
    interaction: AutocompleteInteraction
  ): Promise<Array<autoCompleteData>>;
  execute(interaction: ChatInputCommandInteraction): Promise<any>;
}
