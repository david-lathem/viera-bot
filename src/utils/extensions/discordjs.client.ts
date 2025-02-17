import { extendedAPICommand } from "../typings/types.js";

// Module augmentation for extending client class [with ts, you can mix interface - interface, class - interface NOT class - class unless mixin]
declare module "discord.js" {
  interface Client {
    commands: Array<extendedAPICommand>;
  }
}
