// @TODO(art): Error handling

import assert from "assert";
import { Token, TokenKind } from "./token.js";
import * as ast from "./ast.js";
import { printParserError } from "./main.js";

export { Parser };

class Parser {
  current = 0;

  tokens: Token[];

  constructor(ts: Token[]) {
    assert(ts.length > 0);
    this.tokens = ts;
  }

  parse(): ast.Expr {
    return this.expression();
  }

  expression(): ast.Expr {
    return this.equality();
  }

  equality(): ast.Expr {
    let expr = this.comparison();

    while (this.next(TokenKind.BangEqual, TokenKind.EqualEqual)) {
      const operator = this.advance();
      const right = this.comparison();
      expr = new ast.Expr(
          ast.ExprKind.Binary,
          new ast.ExprBinary(expr, right, operator)
      );
    }

    return expr;
  }

  comparison(): ast.Expr {
    let expr = this.term();

    const { Greater, GreateEqual, Less, LessEqual } = TokenKind;
    while (this.next(Greater, GreateEqual, Less, LessEqual)) {
      const operator = this.advance();
      const right = this.term();
      expr = new ast.Expr(
          ast.ExprKind.Binary,
          new ast.ExprBinary(expr, right, operator)
      );
    }

    return expr;
  }

  term(): ast.Expr {
    let expr = this.factor();

    while (this.next(TokenKind.Minus, TokenKind.Plus)) {
      const operator = this.advance();
      const right = this.factor();
      expr = new ast.Expr(
          ast.ExprKind.Binary,
          new ast.ExprBinary(expr, right, operator)
      );
    }

    return expr;
  }

  factor(): ast.Expr {
    let expr = this.unary();

    while (this.next(TokenKind.Slash, TokenKind.Star)) {
      const operator = this.advance();
      const right = this.unary();
      expr = new ast.Expr(
          ast.ExprKind.Binary,
          new ast.ExprBinary(expr, right, operator)
      );
    }

    return expr;
  }

  unary(): ast.Expr {
    while (this.next(TokenKind.Bang, TokenKind.Minus)) {
      const operator = this.advance();
      const right = this.unary();
      return new ast.Expr(
          ast.ExprKind.Unary,
          new ast.ExprUnary(right, operator)
      );
    }

    return this.primary();
  }

  primary(): ast.Expr {
    const {
      False, True, Nil,
      Number, String,
      LeftParen, RightParen
    } = TokenKind;

    if (this.next(False)) {
      this.advance();
      return new ast.Expr(ast.ExprKind.Literal, new ast.ExprLiteral(false));
    }

    if (this.next(True)) {
      this.advance();
      return new ast.Expr(ast.ExprKind.Literal, new ast.ExprLiteral(true));
    }

    if (this.next(Nil)) {
      this.advance();
      return new ast.Expr(ast.ExprKind.Literal, new ast.ExprLiteral(null));
    }

    if (this.next(Number, String)) {
      const value = this.advance().literal;
      return new ast.Expr(ast.ExprKind.Literal, new ast.ExprLiteral(value));
    }

    if (this.next(LeftParen)) {
      this.advance();
      const expr = this.expression();
      const tok = this.advance();
      if (tok.kind !== RightParen) {
        printParserError(tok, "Expect ')' after expression.");
        assert(false);
      }
      return new ast.Expr(ast.ExprKind.Grouping, new ast.ExprGrouping(expr));
    }

    // @TODO(art): Proper error handling
    printParserError(this.peek(), "Expected expression.");
    assert(false);
  }

  hasTokens(): boolean {
    return this.peek().kind !== TokenKind.Eof;
  }

  peek(): Token {
    const t = this.tokens.at(this.current);
    assert(t != undefined);

    return t;
  }

  advance(): Token {
    const t = this.peek();
    if (this.hasTokens()) this.current++;
    return t;
  }

  next(...tks: TokenKind[]): boolean {
    for (const tk of tks) {
      if (this.peek().kind === tk) return true;
    }

    return false;
  }
}
