#!/usr/bin/node

import fs from "fs/promises";
import readline from "readline";
import { Scanner } from "./scanner.js";
import { Parser } from "./parser.js";
import { Token, TokenKind } from "./token.js";
import { evaluate } from "./evaluator.js";

export { printError, printParserError };

let HAD_ERROR = false;

function printError(line: number, msg: string): void {
  report(line, "", msg);
}

function printParserError(t: Token, msg: string): void {
  if (t.kind === TokenKind.Eof) {
    report(t.line, "at end", msg);
  } else {
    report(t.line, `at '${t.lexeme}'`, msg);
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
  const s = new Scanner(source);
  const tokens = s.scan();

  for (const t of tokens) {
    console.log(t);
  }

  const p = new Parser(tokens);
  const expr = p.parse();
  console.log(expr);

  console.log(evaluate(expr));
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
  console.error(err);
  process.exit(1);
});
