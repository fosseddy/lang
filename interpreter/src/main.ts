#!/usr/bin/node

import fs from "fs/promises";
import readline from "readline";
import { Scanner } from "./scanner.js";
import { Resolver } from "./resolver.js";
import { Parser, ParserError } from "./parser.js";
import { TokenKind } from "./token.js";
import { Interpreter, RuntimeError } from "./interpreter.js";

const interpreter = new Interpreter();

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
  const stmts = p.parse();

  if (HAD_ERROR) return;

  const r = new Resolver(interpreter);
  r.resolve(stmts);

  if (HAD_ERROR) return;

  interpreter.interpret(stmts);
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

// ERROR @TODO(art): move it somewhere?
let HAD_ERROR = false;
let HAD_RUNTIME_ERROR = false;

// @TODO(art): refactor into more general error reporting, rather than
// reporting each individual error
export function reportScannerError(line: number, msg: string): void {
  report(line, "", msg);
}

export function reportParserError(e: ParserError): void {
  if (e.token.kind === TokenKind.Eof) {
    report(e.token.line, "at end", e.message);
  } else {
    report(e.token.line, `at '${e.token.lex}'`, e.message);
  }
}

export function reportRuntimeError(e: RuntimeError): void {
  process.stderr.write(`[line ${e.token.line}] Error ${e.message}\n`);
  HAD_RUNTIME_ERROR = true;
}

// @TODO(art): same as reportScannerError()
export function reportError(line: number, msg: string) {
  report(line, "", msg);
}

function report(line: number, where: string, msg: string): void {
  process.stderr.write(`[line ${line}] Error ${where}: ${msg}\n`);
  HAD_ERROR = true;
}
// ERROR END
