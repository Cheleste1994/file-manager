import os from "os";

export default function handleOsCommand(command) {
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
