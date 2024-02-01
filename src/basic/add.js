import { join } from "path";
import { readFile, writeFile } from "fs";

export default function handleAddCommand(command, currentPath) {
  if (!command) {
    return console.log("Invalid input");
  }

  const pathToFile = join(currentPath, command);

  readFile(pathToFile, (error) => {
    if (error) {
      writeFile(pathToFile, "", (error) => {
        if (error) {
          console.log(error.message);
        }
      });
      return console.log("\nFile created");
    }
    console.log("\nFile exists");
  });
}
