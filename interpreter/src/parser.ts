import assert from "assert";
import { Token, TokenKind } from "./token.js";
import * as ast from "./ast.js";
import { reportParserError } from "./main.js";

export { Parser, ParserError };

class Parser {
  current = 0;

  tokens: Token[];

  constructor(ts: Token[]) {
    assert(ts.length > 0);
    this.tokens = ts;
  }

  parse(): ast.Stmt[] {
    const ss: ast.Stmt[] = [];

    while (this.hasTokens()) {
      try {
        const stmt = this.declaration();
        ss.push(stmt);
      } catch (err) {
        if (err instanceof ParserError) {
          reportParserError(err);
        } else {
          console.error("Unknown error:", err);
        }
        this.synchronize();
      }
    }

    return ss;
  }

  declaration(): ast.Stmt {
    if (this.next(TokenKind.Var)) {
      this.advance();
      return this.declVar();
    }

    return this.statement();
  }

  declVar() {
    const name = this.consume(TokenKind.Identifier, "Expect variable name.");

    let initializer: ast.Expr|null = null;
    if (this.next(TokenKind.Equal)) {
      this.advance();
      initializer = this.expression();
    }

    this.consume(
      TokenKind.Semicolon,
      "Expect ';' after variable declaration."
    );

    return new ast.Stmt(ast.StmtKind.Var, new ast.StmtVar(name, initializer));
  }

  statement(): ast.Stmt {
    if (this.next(TokenKind.Print)) {
      this.advance();
      return this.stmtPrint();
    }

    return this.stmtExpr();
  }

  stmtExpr(): ast.Stmt {
    const expr = this.expression();
    this.consume(TokenKind.Semicolon, "Expect ';' after expression.");
    return new ast.Stmt(ast.StmtKind.Expr, new ast.StmtExpr(expr));
  }

  stmtPrint(): ast.Stmt {
    const expr = this.expression();
    this.consume(TokenKind.Semicolon, "Expect ';' after value.");
    return new ast.Stmt(ast.StmtKind.Print, new ast.StmtPrint(expr));
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
    if (this.next(TokenKind.LeftParen)) {
      this.advance();
      const expr = this.expression();
      this.consume(TokenKind.RightParen, "Expect ')' after expression.");
      return new ast.Expr(ast.ExprKind.Grouping, new ast.ExprGrouping(expr));
    }

    // @TODO(art): extract type ast.ts
    let value: Token|number|string|boolean|null|undefined = undefined;

    if (this.next(TokenKind.False)) value = false;
    if (this.next(TokenKind.True)) value = true;
    if (this.next(TokenKind.Nil)) value = null
    if (this.next(TokenKind.Identifier)) value = this.peek();
    if (this.next(TokenKind.Number, TokenKind.String)) {
      value = this.peek().literal;
    }

    if (value === undefined) {
      throw new ParserError(this.peek(), "Expected expression.");
    }

    this.advance();
    return new ast.Expr(ast.ExprKind.Literal, new ast.ExprLiteral(value));
  }

  synchronize() {
    while (this.hasTokens()) {
      const prev = this.advance();

      if (prev.kind === TokenKind.Semicolon) return;

      if (
        this.next(
          TokenKind.Class,
          TokenKind.Fun,
          TokenKind.Var,
          TokenKind.For,
          TokenKind.If,
          TokenKind.While,
          TokenKind.Print,
          TokenKind.Return
        )
      ) return;
    }
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

  consume(tk: TokenKind, errMsg: string): Token {
    if (!this.next(tk)) {
      throw new ParserError(this.peek(), errMsg);
    }

    return this.advance();
  }
}

class ParserError extends Error {
  token: Token;

  constructor(t: Token, msg: string) {
    super(msg);
    this.token = t;
  }
}
