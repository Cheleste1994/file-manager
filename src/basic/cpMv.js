import { parse, join } from "path";
import { createReadStream, createWriteStream } from "fs";
import handleRmCommand from './rm.js'

export default function handleCpMvCommand(
  [prev, next],
  command = "cp",
  currentPath
) {
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

  const { base: basePrev } = parse(prev);
  const { ext: extNext, base: baseNext, dir: dirNext } = parse(next);

  if (next.includes(":")) {
    pathToFileNext = join(next, extNext ? baseNext : basePrev);
  } else {
    if (extNext) {
      pathToFileNext = join(currentPath, dirNext, baseNext);
    } else {
      pathToFileNext = join(currentPath, baseNext);
      pathToFileNext = join(pathToFileNext, basePrev);
    }
  }

  const readableStream = createReadStream(pathToFilePrev);
  const writableStream = createWriteStream(pathToFileNext);

  readableStream.pipe(writableStream);

  writableStream.on("finish", () => {
    console.log(
      `${
        command === "cp" ? "Copying" : "Move"
      } to ${pathToFileNext} is complete`
    );

    if (command === "mv") {
      handleRmCommand(pathToFilePrev);
    }
  });

  readableStream.on("error", (err) => {
    console.log(`Error reading file: ${err.message}`);
  });

  writableStream.on("error", (err) => {
    console.log(`Error writing file: ${err.message}`);
  });
}
