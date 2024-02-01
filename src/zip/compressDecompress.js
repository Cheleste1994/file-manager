import { parse, join } from "path";
import { createReadStream, createWriteStream } from "fs";
import { createBrotliCompress, createBrotliDecompress } from "zlib";

export default function handleCompressDecompressCommand([prev, next], command = "compress", currentPath) {
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
      pathToFileNext = join(currentPath, baseNext);
    } else {
      pathToFileNext = join(currentPath, baseNext);
      pathToFileNext = join(pathToFileNext, basePrev);
    }
  }

  if (!pathToFileNext.endsWith(".br") && command === "compress") {
    pathToFileNext += ".br";
  }

  if (pathToFileNext.endsWith(".br") && command === "decompress") {
    pathToFileNext = pathToFileNext.slice(0, -3);
  }

  const readableStream = createReadStream(pathToFilePrev);
  const writableStream = createWriteStream(pathToFileNext);

  const brotli =
    command === "compress"
      ? createBrotliCompress()
      : createBrotliDecompress();

  readableStream.pipe(brotli).pipe(writableStream);

  writableStream.on("finish", () => {
    console.log(
      `${
        command === "compress" ? "Compress" : "Decompress"
      } to ${pathToFileNext} is complete`
    );
  });

  readableStream.on("error", (err) => {
    console.log(`Error reading file: ${err.message}`);
  });

  writableStream.on("error", (err) => {
    console.log(`Error writing file: ${err.message}`);
  });
}
