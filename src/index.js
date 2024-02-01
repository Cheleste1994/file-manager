import { homedir } from "os";
import { createInterface } from "readline";
import handleLsCommand from "./navigation/ls.js";
import handleUpCommand from "./navigation/up.js";
import handleCdCommand from "./navigation/cd.js";
import handleOsCommand from "./os/os.js";
import handleCatCommand from "./basic/cat.js";
import handleAddCommand from "./basic/add.js";
import handleRnCommand from "./basic/rn.js";
import handleCpMvCommand from "./basic/cpMv.js";
import handleRmCommand from "./basic/rm.js";
import handleHashCommand from "./hash/hash.js";
import handleCompressDecompressCommand from "./zip/compressDecompress.js";

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
        handleRmCommand(
          command.split(" ").slice(1).join(" "),
          this.currentPath
        );
        break;
      case command.startsWith("hash"):
        handleHashCommand(
          command.split(" ").slice(1).join(" "),
          this.currentPath
        );
        break;
      case command.startsWith("compress"):
        handleCompressDecompressCommand(
          command.split(" ").slice(1, 3),
          "compress",
          this.currentPath
        );
        break;
      case command.startsWith("decompress"):
        handleCompressDecompressCommand(
          command.split(" ").slice(1, 3),
          "decompress",
          this.currentPath
        );
        break;

      default:
        console.log("Invalid input");
    }
  }
}

new App();
