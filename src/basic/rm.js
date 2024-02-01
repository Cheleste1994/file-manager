
export default function handleRmCommand(command, currentPath) {
  if (!command) {
    return console.log("Invalid input");
  }

  let pathToFile;

  if (command.includes(":")) {
    pathToFile = join(command);
  } else {
    pathToFile = join(currentPath, command);
  }

  unlink(pathToFile, (error) => {
    if (error) {
      return console.log(error);
    }
  });
}
