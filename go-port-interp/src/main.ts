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

function exec(source: string): void {
  const s = new Scanner(source);
  const p = new Parser(s.scan());

  interpreter.interpret(p.parse());
}

