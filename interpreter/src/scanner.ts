import assert from "assert";
import { Token, TokenKind, keywords } from "./token.js"
import { reportScannerError } from "./main.js";

type Char = string;

export class Scanner {
  tokens: Token[] = [];
  start = 0;
  current = 0;
  line = 1;

  constructor(public source: string) {}

  scan(): Token[] {
    while (this.hasSource()) {
      this.start = this.current;

      const c = this.advance();

      switch (c) {
      case " ": case "\t": case "\r": break;
      case "\n": this.line++; break;

      case "(": this.addToken(TokenKind.LParen); break;
      case ")": this.addToken(TokenKind.RParen); break;
      case "{": this.addToken(TokenKind.LBrace); break;
      case "}": this.addToken(TokenKind.RBrace); break;
      case ",": this.addToken(TokenKind.Comma); break;
      case ".": this.addToken(TokenKind.Dot); break;
      case "-": this.addToken(TokenKind.Minus); break;
      case "+": this.addToken(TokenKind.Plus); break;
      case ";": this.addToken(TokenKind.Semicolon); break;
      case "*": this.addToken(TokenKind.Star); break;

      case "!":
        if (this.next("=")) {
          this.advance();
          this.addToken(TokenKind.BangEq);
        } else {
          this.addToken(TokenKind.Bang);
        }
        break;
      case "=":
        if (this.next("=")) {
          this.advance();
          this.addToken(TokenKind.EqEq);
        } else {
          this.addToken(TokenKind.Eq);
        }
        break;
      case "<":
        if (this.next("=")) {
          this.advance();
          this.addToken(TokenKind.LessEq);
        } else {
          this.addToken(TokenKind.Less);
        }
        break;
      case ">":
        if (this.next("=")) {
          this.advance();
          this.addToken(TokenKind.GreaterEq);
        } else {
          this.addToken(TokenKind.Greater);
        }
        break;

      case "/":
        if (this.next("/")) {
          // consume comment
          while (!this.next("\n") && this.hasSource()) this.advance();
        } else {
          this.addToken(TokenKind.Slash);
        }
        break;

      case '"': {
        while (!this.next('"') && this.hasSource()) {
          if (this.next("\n")) this.line++;
          this.advance();
        }

        if (!this.hasSource()) {
          reportScannerError(this.line, "Unterminated string literal");
          break;
        }

        // consume closing "
        this.advance();

        const lit = this.source.slice(this.start + 1, this.current - 1);
        this.addToken(TokenKind.Str, lit);
      } break;

      default:
        if (isDigit(c)) {
          while (isDigit(this.peek())) this.advance();

          if (this.next(".") && isDigit(this.peek2())) {
            // consume .
            this.advance();
            while (isDigit(this.peek())) this.advance();
          }

          const lit = Number(this.source.slice(this.start, this.current));
          assert(!isNaN(lit));

          this.addToken(TokenKind.Num, lit);
        } else if (isAlpha(c)) {
          while (isAlphaNum(this.peek())) this.advance();

          const lexem = this.source.slice(this.start, this.current);
          const kind = keywords.get(lexem) ?? TokenKind.Ident;

          this.addToken(kind);
        } else {
          reportScannerError(this.line, `Unexpected character: '${c}'`);
        }
        break;
      }
    }

    this.addToken(TokenKind.Eof, null, "");

    return this.tokens;
  }

  hasSource(): boolean {
    return this.current < this.source.length;
  }

  advance(): Char {
    const c = this.source.at(this.current++);
    assert(c != undefined);

    return c;
  }

  next(c: Char): boolean {
    if (!this.hasSource()) return false;

    return this.peek() === c;
  }

  peek(): Char {
    if (!this.hasSource()) return "\0";

    const c = this.source.at(this.current);
    assert(c != undefined);

    return c;
  }

  peek2(): Char {
    if (this.current + 1 > this.source.length) return "\0";

    const c = this.source.at(this.current + 1);
    assert(c != undefined);

    return c;
  }

  addToken(kind: TokenKind, lit: number|string|null = null,
           lexeme?: string): void {
    this.tokens.push(
      new Token(
        kind,
        lexeme ?? this.source.slice(this.start, this.current),
        lit,
        this.line
      )
    );
  }
}

function isDigit(c: Char): boolean {
  return c >= "0" && c <= "9";
}

function isAlpha(c: Char): boolean {
  return (c >= "a" && c <= "z") ||
         (c >= "A" && c <= "Z") ||
         c === "_"
}

function isAlphaNum(c: Char): boolean {
  return isDigit(c) || isAlpha(c);
}
