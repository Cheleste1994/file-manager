import { dirname, parse, join } from "path";
import { fileURLToPath } from "url";
import os, { homedir } from "os";
import { createInterface } from "readline";
import {
  readFile,
  constants,
  createReadStream,
  createWriteStream,
  writeFile,
  rename,
  unlink,
} from "fs";
import fs from "fs/promises";
import crypto from "crypto";
import { createBrotliCompress, createBrotliDecompress } from "zlib";

class App {
  userName;
  currentPath = homedir();
  messageCurrent = () => `You are currently in ${this.currentPath}`;
  messageExit = `Thank you for using File Manager, ${
    this.userName || "Username"
  }, goodbye!`;
  __dirname;
  __dirname;

  constructor() {
    this.userName = process.argv
      .slice(2)
      .filter((arg) => arg.includes("username"))[0]
      ?.split("=")[1];

    this.__filename = fileURLToPath(import.meta.url);
    this.__dirname = dirname(this.__filename);

    this.startFileManager();
  }

  startFileManager() {
    console.log(`Welcome to the File Manager, ${this.userName || "Username"}!`);
    console.log(this.messageCurrent());

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on("line", async (line) => {
      if (line.includes(".exit")) {
        return rl.close();
      }

      await this.handleCommands(line);

      console.log(this.messageCurrent());
    }).on("close", () => {
      console.log(this.messageExit);
    });
  }

  async handleCommands(command) {
    switch (true) {
      case command === "ls":
        await this.handleLsCommand();
        break;
      case command.startsWith("os"):
        this.handleOsCommand(command.split(" ")[1]);
        break;
      case command === "up":
        this.handleUpCommand();
        break;
      case command.startsWith("cd"):
        await this.handleCdCommand(command.split(" ").slice(1).join(" "));
        break;
      case command.startsWith("cat"):
        this.handleCatCommand(command.split(" ").slice(1).join(" "));
        break;
      case command.startsWith("add"):
        this.handleAddCommand(command.split(" ").slice(1).join(" "));
        break;
      case command.startsWith("rn"):
        this.handleRnCommand(command.split(" ").slice(1, 3));
        break;
      case command.startsWith("cp"):
        this.handleCpMvCommand(command.split(" ").slice(1, 3), "cp");
        break;
      case command.startsWith("mv"):
        this.handleCpMvCommand(command.split(" ").slice(1, 3), "mv");
        break;
      case command.startsWith("rm"):
        this.handleRmCommand(command.split(" ").slice(1).join(" "));
        break;
      case command.startsWith("hash"):
        this.handleHashCommand(command.split(" ").slice(1).join(" "));
        break;
      case command.startsWith("compress"):
        this.handleCompressDecompressCommand(
          command.split(" ").slice(1, 3),
          "compress"
        );
        break;
      case command.startsWith("decompress"):
        this.handleCompressDecompressCommand(
          command.split(" ").slice(1, 3),
          "decompress"
        );
        break;

      default:
        console.log("Invalid input");
    }
  }

  async handleLsCommand() {
    try {
      const files = await fs.readdir(this.currentPath);

      const newData = files.map((dir) => ({
        Name: dir,
        Type: parse(dir).ext ? "file" : "directory",
      }));

      console.table(newData);
    } catch (error) {
      console.log(error.message);
    }
  }

  handleOsCommand(command) {
    switch (command) {
      case "--EOL":
        console.log(os.EOL);
        break;
      case "--cpus":
        console.table(os.cpus());
        break;
      case "--homedir":
        console.table(os.homedir());
        break;
      case "--username":
        console.table(os.userInfo().username);
        break;
      case "--architecture":
        console.table(os.arch());
        break;
      default:
        console.log("Invalid input");
    }
  }

  handleUpCommand() {
    const { base, dir } = parse(this.currentPath);
    if (base !== dir) {
      this.currentPath = dir;
    }
  }

  async handleCdCommand(command) {
    if (!command) {
      return console.log("Invalid input");
    }

    const prevPath = this.currentPath;
    let nextPath;

    if (command.includes(":")) {
      nextPath = join(command);
    } else {
      nextPath = join(prevPath, command);
    }

    try {
      await fs.access(nextPath, constants.F_OK);
      this.currentPath = nextPath;
    } catch (error) {
      this.currentPath = prevPath;
      console.log(error.message);
    }
  }

  handleCatCommand(command) {
    if (!command) {
      return console.log("Invalid input");
    }

    let pathToFile;

    if (command.includes(":")) {
      pathToFile = join(command);
    } else {
      pathToFile = join(this.currentPath, command);
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

  handleAddCommand(command) {
    if (!command) {
      return console.log("Invalid input");
    }

    const pathToFile = join(this.currentPath, command);

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

  handleRnCommand([prev, next]) {
    if (!prev || !next) {
      return console.log("Invalid input");
    }

    let pathToFilePrev;

    if (prev.includes(":")) {
      pathToFilePrev = join(prev);
    } else {
      pathToFilePrev = join(this.currentPath, prev);
    }

    let pathToFileNext;

    if (next.includes(":")) {
      pathToFileNext = join(next);
    } else {
      pathToFileNext = join(this.currentPath, next);
    }

    rename(pathToFilePrev, pathToFileNext, (error) => {
      if (error) {
        return console.log(error.message);
      }

      console.log("\nFile renamed");
    });
  }

  handleCpMvCommand([prev, next], command = "cp") {
    if (!prev || !next) {
      return console.log("Invalid input");
    }

    let pathToFilePrev;

    if (prev.includes(":")) {
      pathToFilePrev = join(prev);
    } else {
      pathToFilePrev = join(this.currentPath, prev);
    }

    let pathToFileNext;

    const { base: basePrev } = parse(prev);
    const { ext: extNext, base: baseNext, dir: dirNext } = parse(next);

    if (next.includes(":")) {
      pathToFileNext = join(next, extNext ? baseNext : basePrev);
    } else {
      if (extNext) {
        pathToFileNext = join(this.currentPath, dirNext, baseNext);
      } else {
        pathToFileNext = join(this.currentPath, baseNext);
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
        this.handleRmCommand(pathToFilePrev);
      }
    });

    readableStream.on("error", (err) => {
      console.log(`Error reading file: ${err.message}`);
    });

    writableStream.on("error", (err) => {
      console.log(`Error writing file: ${err.message}`);
    });
  }

  handleCompressDecompressCommand([prev, next], command = "compress") {
    if (!prev || !next) {
      return console.log("Invalid input");
    }

    let pathToFilePrev;

    if (prev.includes(":")) {
      pathToFilePrev = join(prev);
    } else {
      pathToFilePrev = join(this.currentPath, prev);
    }

    let pathToFileNext;

    const { base: basePrev } = parse(prev);
    const { ext: extNext, base: baseNext, dir: dirNext } = parse(next);

    if (next.includes(":")) {
      pathToFileNext = join(next, extNext ? baseNext : basePrev);
    } else {
      if (extNext === '.br') {
        pathToFileNext = join(this.currentPath, dirNext, baseNext);
      } else {
        pathToFileNext = join(this.currentPath, baseNext);
        pathToFileNext = join(pathToFileNext, basePrev);
      }
    }

    if (!pathToFileNext.endsWith('.br') && command === 'compress') {
      pathToFileNext += '.br'
    }

    if (pathToFileNext.endsWith('.br') && command === 'decompress') {
      pathToFileNext = pathToFileNext.slice(0, -3)
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

  handleRmCommand(command) {
    if (!command) {
      return console.log("Invalid input");
    }

    let pathToFile;

    if (command.includes(":")) {
      pathToFile = join(command);
    } else {
      pathToFile = join(this.currentPath, command);
    }

    unlink(pathToFile, (error) => {
      if (error) {
        return console.log(error);
      }
    });
  }

  handleHashCommand(command) {
    if (!command) {
      return console.log("Invalid input");
    }

    let pathToFile;

    if (command.includes(":")) {
      pathToFile = join(command);
    } else {
      pathToFile = join(this.currentPath, command);
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
}

new App();
