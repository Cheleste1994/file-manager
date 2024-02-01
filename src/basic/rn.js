import { join } from "path";
import { rename } from "fs";

export default function handleRnCommand([prev, next], currentPath) {
  if (!prev || !next) {
    return console.log("Invalid input");
  }

  let pathToFilePrev;

  if (prev.includes(":")) {
    pathToFilePrev = join(prev);
  } else {
    pathToFilePrev = join(currentPath, prev);
  }

  let pathToFileNext;

  if (next.includes(":")) {
    pathToFileNext = join(next);
  } else {
    pathToFileNext = join(currentPath, next);
  }

  rename(pathToFilePrev, pathToFileNext, (error) => {
    if (error) {
      return console.log(error.message);
    }

    console.log("\nFile renamed");
  });
}
