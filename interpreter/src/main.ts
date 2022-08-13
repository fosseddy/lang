#!/usr/bin/node

import fs from "fs/promises";
import readline from "readline";

import * as scanner from "./scanner.js";
import * as parser from "./parser.js";
import { Token, TokenKind } from "./token.js";

let HAD_ERROR = false;

function todo(name: string): void {
  console.log(`${name}: not implemented`);
}

export function printError(line: number, msg: string): void {
  report(line, "", msg);
}

export function printParserError(t: Token, msg: string): void {
  if (t.kind === TokenKind.Eof) {
    report(t.line, " at end", msg);
  } else {
    report(t.line, ` at '${t.lexeme}'`, msg);
  }
}

function report(line: number, where: string, msg: string): void {
  process.stderr.write(`[line ${line}] Error ${where}: ${msg}\n`);
  HAD_ERROR = true;
}

async function execFile(path: string): Promise<void> {
  const source = await fs.readFile(path, { encoding: "utf8" });
  exec(source);
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

function exec(source: string): void {
  const s: scanner.Scanner = {
    source,
    tokens: [],
    start: 0,
    current: 0,
    line: 1
  };

  scanner.scan(s);
  for (const t of s.tokens) {
    console.log(t);
  }

  const p: parser.Parser = {
    // @NOTE(art): assing by reference
    tokens: s.tokens,
    current: 0
  }

  console.log(parser.parse(p));
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
