import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';



const userName = process.argv
  .slice(2)
  .filter((arg) => arg.includes("username"))[0]
  ?.split("=")[1];

  const homeDirectory = homedir();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

console.log(`Welcome to the File Manager, ${userName || "Username"}!`);
console.log(`You are currently in ${homeDirectory}`);


