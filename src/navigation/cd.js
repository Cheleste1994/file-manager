import { join } from "path";
import fs from "fs/promises";
import { constants } from "fs";

export default async function handleCdCommand(command, currentPath) {
  if (!command) {
    return console.log("Invalid input");
  }

  const prevPath = currentPath;
  let nextPath;

  if (command.includes(":")) {
    nextPath = join(command);
  } else {
    nextPath = join(prevPath, command);
  }

  try {
    await fs.access(nextPath, constants.F_OK);
    return nextPath;
  } catch (error) {
    console.log(error.message);
    return prevPath;
  }
}
