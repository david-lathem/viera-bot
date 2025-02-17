import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { Client, Events } from "discord.js";

import { getDynamicPathToEvents } from "../path.js";

const registerEventsOnClient = async (client: Client) => {
  const eventFolders = await fs.readdir(getDynamicPathToEvents(), {
    withFileTypes: true,
  });

  const eventValues = Object.values(Events);

  console.log(`Registering ${eventFolders.length} event(s)`);

  for (const eventFolder of eventFolders) {
    if (!eventFolder.isDirectory()) continue;

    if (!eventValues.includes(eventFolder.name as Events))
      throw new Error(`${eventFolder.name} is not a valid discord js event`);

    const eventFiles = await fs.readdir(
      getDynamicPathToEvents([eventFolder.name])
    );

    const onlyJSFiles = eventFiles.filter((f) => f.endsWith(".js"));

    for (const file of onlyJSFiles) {
      const { default: handler } = await import(
        pathToFileURL(getDynamicPathToEvents([eventFolder.name, file])).href
      );

      if (typeof handler !== "function")
        throw new Error(
          `${file} does not provide a default export for event listener`
        );

      client.on(eventFolder.name, handler);
    }
  }
};

export default registerEventsOnClient;
