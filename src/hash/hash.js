import { join } from "path";
import crypto from "crypto";
import { createReadStream } from "fs";

export default function handleHashCommand(command, currentPath) {
  if (!command) {
    return console.log("Invalid input");
  }

  let pathToFile;

  if (command.includes(":")) {
    pathToFile = join(command);
  } else {
    pathToFile = join(currentPath, command);
  }

  const fileStream = createReadStream(pathToFile, { highWaterMark: 10 });

  fileStream.on("data", (chunk) => {
    const hash = crypto.createHash("sha256");
    const finalHex = hash.update(chunk.toString()).digest("hex");

    console.log(`${finalHex}\n`);
  });

  fileStream.on("error", (error) => {
    console.log(error.message);
  });

  fileStream.on("end", () => {
    console.log("Success!");
  });
}
