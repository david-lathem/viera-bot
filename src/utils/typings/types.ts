import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

export interface extendedAPICommand
  extends RESTPostAPIChatInputApplicationCommandsJSONBody {
  permissionRequired?: bigint | Array<bigint>;
  guildOnly?: Boolean;
  autocomplete?(
    interaction: AutocompleteInteraction
  ): Promise<Array<ApplicationCommandOptionChoiceData | string>>;
  execute(interaction: ChatInputCommandInteraction): Promise<any>;
}

export interface Guild {
  guildId: string;
  kaosCommandChannelId?: string;
  ticketChannelId?: string;
  raceConfig: RaceConfig;
}

export type KaosItemType = "POINTS" | "KIT" | "ITEM";

export interface KaosItem {
  guildId: string;
  name: string;
  kaosId: string;
  quantity: number;
  odds: number;
  type: KaosItemType;
  threeXWin: 0 | 1;
}

export type RaceConfig = { currency: string; rewards: RaceReward[] };
export type RaceReward = { position: number; points: number };

export interface GuildIdQuery {
  guildId: string;
}

export interface RewardConfigUpdateOptions {
  guildId: string;
  points: number;
  path: string;
}

export interface CurrencyUpdatOptions extends GuildIdQuery {
  currency: string;
}

export interface kaosItemQuery extends GuildIdQuery {
  kaosId: string;
}
