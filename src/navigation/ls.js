import fs from "fs/promises";
import { parse } from "path";

export default async function handleLsCommand (currentPath) {
  try {
    const files = await fs.readdir(currentPath);

    const newData = files.map((dir) => ({
      Name: dir,
      Type: parse(dir).ext ? "file" : "directory",
    }));

    console.table(newData);
  } catch (error) {
    console.log(error.message);
  }
}
