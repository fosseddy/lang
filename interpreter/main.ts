#!/usr/bin/node

import fs from "fs/promises";

async function execFile(path: string): Promise<void> {
  const text = await fs.readFile(path, { encoding: "utf8" });
  console.log(text);
}

function execPrompt(): void {
  console.log("not implemented");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length > 1) {
    process.stderr.write("Usage: interp [SCRIPT]\n");
    process.exit(1);
  } else if (args.length === 1) {
    await execFile(args[0]!);
  } else {
    execPrompt();
  }
}

main().catch(err => {
  process.stderr.write(err.toString() + "\n");
  process.exit(1);
});
