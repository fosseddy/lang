import { Token, TokenKind } from "./token.js"
import assert from "assert";
import { printError } from "./main.js";

export type Scanner = {
  source: string;
  tokens: Token[];

  start: number;
  current: number;
  line: number;
}

export function scan(s: Scanner): void {
  while (hasSource(s)) {
    s.start = s.current;
    scanToken(s);
  }

  s.tokens.push({
    kind: TokenKind.Eof,
    lexeme: "",
    literal: null,
    line: s.line
  });
}

function scanToken(s: Scanner): void {
  const c = advance(s);
  switch(c) {
  case "(": addToken(s, TokenKind.LeftParen, null); break;
  case ")": addToken(s, TokenKind.RightParen, null); break;
  case "{": addToken(s, TokenKind.LeftBrace, null); break;
  case "}": addToken(s, TokenKind.RightBrace, null); break;
  case ",": addToken(s, TokenKind.Comma, null); break;
  case ".": addToken(s, TokenKind.Dot, null); break;
  case "-": addToken(s, TokenKind.Minus, null); break;
  case "+": addToken(s, TokenKind.Plus, null); break;
  case ";": addToken(s, TokenKind.Semicolon, null); break;
  case "*": addToken(s, TokenKind.Star, null); break;

  case "!":
    addToken(s, match(s, "=") ? TokenKind.BangEqual : TokenKind.Bang, null);
    break;
  case "=":
    addToken(s, match(s, "=") ? TokenKind.EqualEqual : TokenKind.Equal, null);
    break;
  case "<":
    addToken(s, match(s, "=") ? TokenKind.LessEqual : TokenKind.Less, null);
    break;
  case ">":
    addToken(s, match(s, "=") ? TokenKind.GreateEqual : TokenKind.Greater, null);
    break;

  case "/":
    if (match(s, "/")) {
      while (peek(s) != "\n" && hasSource(s)) advance(s);
    } else {
      addToken(s, TokenKind.Slash, null);
    }
    break;

  case '"': {
    while (peek(s) !== '"' && hasSource(s)) {
      if (peek(s) === "\n") s.line++;
      advance(s);
    }

    if (!hasSource(s)) {
      printError(s.line, "Unterminated string literal");
      break;
    }

    // consume closing "
    advance(s);

    const lit = s.source.slice(s.start + 1, s.current - 1);
    addToken(s, TokenKind.String, lit);
  } break;

  case "\n": s.line++; break;

  case " ": case "\t": case "\r": break;

  default:
    if (isDigit(c)) {
      while (isDigit(peek(s)) && hasSource(s)) advance(s);

      if (peek(s) === "." && isDigit(peek2(s))) {
        // consume .
        advance(s);
        while (isDigit(peek(s)) && hasSource(s)) advance(s);
      }

      const lit = parseFloat(s.source.slice(s.start, s.current));
      addToken(s, TokenKind.Number, lit);

    } else {
      printError(s.line, "Unexpected character: " + c);
    }
    break;
  }
}

function hasSource(s: Scanner): boolean {
  return s.current < s.source.length;
}

function advance(s: Scanner): string {
  const c = s.source.at(s.current++);
  assert(c != undefined);

  return c;
}

function match(s: Scanner, m: string): boolean {
  if (!hasSource(s)) return false;

  const c = s.source.at(s.current);
  assert(c != undefined);

  if (c !== m) return false;

  s.current++;
  return true;
}

function peek(s: Scanner): string {
  if (!hasSource(s)) return "\0";

  const c = s.source.at(s.current);
  assert(c != undefined);

  return c;
}

function peek2(s: Scanner): string {
  if (s.current + 1 > s.source.length) return "\0";

  const c = s.source.at(s.current + 1);
  assert(c != undefined);

  return c;
}

function addToken(s: Scanner, kind: TokenKind, lit: number|string|null): void {
  s.tokens.push({
    kind,
    line: s.line,
    literal: lit,
    lexeme: s.source.slice(s.start, s.current)
  });
}

function isDigit(char: string) {
  return char >= "0" && char <= "9";
}