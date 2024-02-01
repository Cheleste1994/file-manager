import { parse, join } from "path";
import { homedir } from "os";
import { createInterface } from "readline";
import { createReadStream, createWriteStream, unlink } from "fs";
import crypto from "crypto";
import { createBrotliCompress, createBrotliDecompress } from "zlib";
import handleLsCommand from "./navigation/ls.js";
import handleUpCommand from "./navigation/up.js";
import handleCdCommand from "./navigation/cd.js";
import handleOsCommand from "./os/os.js";
import handleCatCommand from "./basic/cat.js";
import handleAddCommand from "./basic/add.js";
import handleRnCommand from "./basic/rn.js";
import handleCpMvCommand from "./basic/cpMv.js";
import handleRmCommand from "./basic/rm.js";

class App {
  userName;
  currentPath = homedir();
  messageCurrent = () => `You are currently in ${this.currentPath}`;
  messageExit = `Thank you for using File Manager, ${
    this.userName || "Username"
  }, goodbye!`;

  constructor() {
    this.userName = process.argv
      .slice(2)
      .filter((arg) => arg.includes("username"))[0]
      ?.split("=")[1];

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
        await handleLsCommand(this.currentPath);
        break;
      case command.startsWith("os"):
        handleOsCommand(command.split(" ")[1]);
        break;
      case command === "up":
        this.currentPath = handleUpCommand(this.currentPath);
        break;
      case command.startsWith("cd"):
        this.currentPath = await handleCdCommand(
          command.split(" ").slice(1).join(" "),
          this.currentPath
        );
        break;
      case command.startsWith("cat"):
        handleCatCommand(
          command.split(" ").slice(1).join(" "),
          this.currentPath
        );
        break;
      case command.startsWith("add"):
        handleAddCommand(
          command.split(" ").slice(1).join(" "),
          this.currentPath
        );
        break;
      case command.startsWith("rn"):
        handleRnCommand(command.split(" ").slice(1, 3), this.currentPath);
        break;
      case command.startsWith("cp"):
        handleCpMvCommand(
          command.split(" ").slice(1, 3),
          "cp",
          this.currentPath
        );
        break;
      case command.startsWith("mv"):
        handleCpMvCommand(
          command.split(" ").slice(1, 3),
          "mv",
          this.currentPath
        );
        break;
      case command.startsWith("rm"):
        handleRmCommand(command.split(" ").slice(1).join(" "), this.currentPath);
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
      if (extNext === ".br") {
        pathToFileNext = join(this.currentPath, dirNext, baseNext);
      } else {
        pathToFileNext = join(this.currentPath, baseNext);
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
