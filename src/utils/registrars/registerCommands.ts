import fs from "node:fs/promises";
import { Dirent } from "node:fs";

import { Client, Routes } from "discord.js";

import {
  getDynamicFilePathToCommands,
  getDynamicPathToCommands,
} from "../path.js";
import { extendedAPICommand } from "../typings/types.js";

const registerAndAttachCommandsOnClient = async (client: Client<true>) => {
  const commandPaths: Array<string> = [];

  const commands = await fs.readdir(getDynamicPathToCommands(), {
    withFileTypes: true,
  });

  const commandFolders: Array<Dirent> = [];

  // Separate direct command files and nested command folders
  for (const command of commands) {
    if (command.isFile() && command.name.endsWith(".js"))
      commandPaths.push(getDynamicFilePathToCommands([command.name]));

    if (command.isDirectory()) commandFolders.push(command);
  }

  // Get nested command files from the folders
  for (const commandFolder of commandFolders) {
    const commands = await fs.readdir(
      getDynamicPathToCommands([commandFolder.name])
    );

    const onlyJSFiles = commands.filter((c) => c.endsWith(".js"));

    commandPaths.push(
      ...onlyJSFiles.map((f) =>
        getDynamicFilePathToCommands([commandFolder.name, f])
      )
    );
  }

  // Import commands and cache the object as well as register them

  for (const commandPath of commandPaths) {
    const { default: commandData }: { default: extendedAPICommand } =
      await import(commandPath);

    if (!commandData)
      throw new Error(`${commandPath} does not export a command object`);

    client.commands.push(commandData);
  }

  if (client.commands.length === 0)
    return console.log("No command found to be registered");

  await client.rest.put(Routes.applicationCommands(client.user.id), {
    body: client.commands,
  });
};

export default registerAndAttachCommandsOnClient;
