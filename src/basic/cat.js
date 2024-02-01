import { join } from "path";
import { createReadStream } from "fs";

export default function handleCatCommand(command, currentPath) {
  if (!command) {
    return console.log("Invalid input");
  }

  let pathToFile;

  if (command.includes(":")) {
    pathToFile = join(command);
  } else {
    pathToFile = join(currentPath, command);
  }

  const readableStream = createReadStream(pathToFile, "utf-8");

  readableStream.on("data", (chunk) => {
    console.log(chunk);
  });

  readableStream.on("error", (error) => {
    console.log(error.message);
  });

  readableStream.on("end", () => {
    console.log("\n\n File read");
  });
}
