import path from "node:path";
import { pathToFileURL } from "node:url";

const __dirname = import.meta.dirname;

function getDynamicPath(folder: string, remainingDynamicPath: Array<string>) {
  return path.join(__dirname, "..", folder, ...remainingDynamicPath);
}

export function getDynamicPathToEvents(
  remainingDynamicPath: Array<string> = []
) {
  return getDynamicPath("events", remainingDynamicPath);
}

export function getDynamicPathToCommands(
  remainingDynamicPath: Array<string> = []
) {
  return getDynamicPath("commands", remainingDynamicPath);
}

export function getDynamicFilePathToCommands(
  remainingDynamicPath: Array<string> = []
) {
  return pathToFileURL(getDynamicPath("commands", remainingDynamicPath)).href;
}
