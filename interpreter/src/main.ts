#!/usr/bin/node

import fs from "fs/promises";
import readline from "readline";
import { Scanner } from "./scanner.js";
import { Parser, ParserError } from "./parser.js";
import { Token, TokenKind } from "./token.js";
import { Interpreter, RuntimeError } from "./interpreter.js";

export { reportScannerError, reportParserError, reportRuntimeError };

const interpreter = new Interpreter();

// ERROR @TODO(art): move it somewhere?
let HAD_ERROR = false;
let HAD_RUNTIME_ERROR = false;

function reportScannerError(line: number, msg: string): void {
  report(line, "", msg);
}

function reportParserError(e: ParserError): void {
  if (e.token.kind === TokenKind.Eof) {
    report(e.token.line, "at end", e.message);
  } else {
    report(e.token.line, `at '${e.token.lexeme}'`, e.message);
  }
}

function reportRuntimeError(e: RuntimeError): void {
  process.stderr.write(`[line ${e.token.line}] Error ${e.message}\n`);
  HAD_RUNTIME_ERROR = true;
}

function report(line: number, where: string, msg: string): void {
  process.stderr.write(`[line ${line}] Error ${where}: ${msg}\n`);
  HAD_ERROR = true;
}
// ERROR END

async function execFile(path: string): Promise<void> {
  const source = await fs.readFile(path, { encoding: "utf8" });
  exec(source);
  if (HAD_ERROR) process.exit(1);
  if (HAD_RUNTIME_ERROR) process.exit(1);
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
  const p = new Parser(s.scan());

  interpreter.interpret(p.parse());
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
