#!/usr/bin/node

import fs from "fs/promises";
import readline from "readline";

let HAD_ERROR = false;

function todo(name: string): void {
  console.log(`${name}: not implemented`);
}

function makeError(line: number, msg: string): void {
  report(line, "", msg);
}

function report(line: number, where: string, msg: string): void {
  process.stderr.write(`[line ${line}] Error ${where}: ${msg}`);
  HAD_ERROR = true;
}

async function execFile(path: string): Promise<void> {
  const text = await fs.readFile(path, { encoding: "utf8" });
  exec(text);
  if (HAD_ERROR) process.exit(1);
}

async function execPrompt(): Promise<void> {
  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  reader.prompt();
  for await (const line of reader) {
    exec(line);
    HAD_ERROR = false;
    reader.prompt();
  }
}

function exec(_: string): void {
  todo("exec");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length > 1) {
    process.stderr.write("Usage: interp [SCRIPT]\n");
    process.exit(1);
  } else if (args.length === 1) {
    await execFile(args[0]!);
  } else {
    await execPrompt();
  }
}

main().catch(err => {
  process.stderr.write(err.toString() + "\n");
  process.exit(1);
});
