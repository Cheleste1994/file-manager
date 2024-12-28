import { parse } from "path";

export default function handleUpCommand(currentPath) {
  const { base, dir } = parse(currentPath);
  if (base !== dir) {
    return dir;
  }

  return currentPath;
}
