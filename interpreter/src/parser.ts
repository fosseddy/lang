import assert from "assert";
import { Token, TokenKind } from "./token.js";
import * as ast from "./ast.js";
import { reportParserError } from "./main.js";

export class Parser {
  current = 0;

  constructor(public tokens: Token[]) {
    assert(this.tokens.length > 0);
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
          console.error("Unknown Parser Error:", err);
          process.exit(1);
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

    if (this.next(TokenKind.Fun)) {
      this.advance();
      return this.declFun("function");
    }

    if (this.next(TokenKind.Class)) {
      this.advance();
      return this.declClass();
    }

    return this.statement();
  }

  declClass(): ast.Stmt {
    const tok = this.consume(TokenKind.Ident, "Excpect class name.");
    let parent: ast.Expr|null = null;
    if (this.next(TokenKind.Less)) {
      this.advance();
      parent = new ast.Expr(
        ast.ExprKind.Var,
        new ast.ExprVar(
          this.consume(TokenKind.Ident, "Expect parent class name.")
        )
      );
    }

    this.consume(TokenKind.LBrace, "Expect '{' before class body.");

    const methods: ast.Stmt[] = [];
    while (!this.next(TokenKind.RBrace) && this.hasTokens()) {
      methods.push(this.declFun("method"));
    }

    this.consume(TokenKind.RBrace, "Expect '}' after class body.");

    return new ast.Stmt(
      ast.StmtKind.Class,
      new ast.StmtClass(tok, parent, methods)
    );
  }

  declFun(kind: string): ast.Stmt {
    const name = this.consume(TokenKind.Ident, `Expect ${kind} name`);
    this.consume(TokenKind.LParen, `Expect '(' after ${kind} name`);

    const params: Token[] = [];
    if (!this.next(TokenKind.RParen)) {
      for (;;) {
        if (params.length >= 255) {
          reportParserError(
            new ParserError(
              this.peek(),
              "Can't have more than 255 parameters."
            )
          );
        }

        params.push(this.consume(TokenKind.Ident, "Expect parameter name."));

        if (!this.next(TokenKind.Comma)) break;

        this.advance();
      }
    }

    this.consume(TokenKind.RParen, "Expect ')' after parameters.");

    this.consume(TokenKind.LBrace, `Expect '{' before ${kind} body.`);
    const body = this.block();

    return new ast.Stmt(ast.StmtKind.Fun, new ast.StmtFun(name, params, body));
  }

  declVar(): ast.Stmt {
    const name = this.consume(TokenKind.Ident, "Expect variable name.");

    let initializer: ast.Expr|null = null;
    if (this.next(TokenKind.Eq)) {
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

    if (this.next(TokenKind.LBrace)) {
      this.advance();
      return new ast.Stmt(ast.StmtKind.Block, new ast.StmtBlock(this.block()));
    }

    if (this.next(TokenKind.If)) {
      this.advance();
      return this.stmtIf();
    }

    if (this.next(TokenKind.While)) {
      this.advance();
      return this.stmtWhile();
    }

    if (this.next(TokenKind.For)) {
      this.advance();
      return this.stmtFor();
    }

    if (this.next(TokenKind.Ret)) {
      return this.stmtRet();
    }

    return this.stmtExpr();
  }

  block(): ast.Stmt[] {
    const ss: ast.Stmt[] = [];

    while (!this.next(TokenKind.RBrace) && this.hasTokens()) {
      ss.push(this.declaration());
    }

    this.consume(TokenKind.RBrace, "Expect '}' after block.");

    return ss;
  }

  stmtRet(): ast.Stmt {
    const token = this.advance();

    let expr: ast.Expr|null = null;
    if (!this.next(TokenKind.Semicolon)) {
      expr = this.expression();
    }

    this.consume(TokenKind.Semicolon, "Expect ';' after return value.");

    return new ast.Stmt(ast.StmtKind.Ret, new ast.StmtRet(token, expr));
  }

  stmtFor(): ast.Stmt {
    this.consume(TokenKind.LParen, "Expect '(' after for.");

    let init: ast.Stmt|null = null;
    if (this.next(TokenKind.Semicolon)) {
      this.advance();
    } else if (this.next(TokenKind.Var)) {
      this.advance();
      init = this.declVar();
    } else {
      init = this.stmtExpr();
    }

    let cond: ast.Expr|null = null;
    if (!this.next(TokenKind.Semicolon)) {
      cond = this.expression();
    }

    this.consume(TokenKind.Semicolon, "Expect ';' after loop condition.");

    let inc: ast.Expr|null = null;
    if (!this.next(TokenKind.RParen)) {
      inc = this.expression();
    }

    this.consume(TokenKind.RParen, "Expect ')' after for clauses.");

    let body = this.statement();

    if (inc) {
      body = new ast.Stmt(
        ast.StmtKind.Block,
        new ast.StmtBlock([
          body,
          new ast.Stmt(ast.StmtKind.Expr, new ast.StmtExpr(inc))
        ])
      );
    }

    if (!cond) cond = new ast.Expr(ast.ExprKind.Lit, new ast.ExprLit(true));

    body = new ast.Stmt(ast.StmtKind.While, new ast.StmtWhile(cond, body));

    if (init) {
      body = new ast.Stmt(
        ast.StmtKind.Block,
        new ast.StmtBlock([init, body])
      );
    }

    return body;
  }

  stmtWhile(): ast.Stmt {
    this.consume(TokenKind.LParen, "Expect '(' after while.");
    const cond = this.expression();
    this.consume(TokenKind.RParen, "Expect ')' after while condition.");

    const body = this.statement();

    return new ast.Stmt(ast.StmtKind.While, new ast.StmtWhile(cond, body));
  }

  stmtIf(): ast.Stmt {
    this.consume(TokenKind.LParen, "Expect '(' after if.");
    const cond = this.expression();
    this.consume(TokenKind.RParen, "Expect ')' after if condition.");

    const then = this.statement();
    let elze: ast.Stmt|null = null;

    if (this.next(TokenKind.Else)) {
      this.advance();
      elze = this.statement();
    }

    return new ast.Stmt(ast.StmtKind.If, new ast.StmtIf(cond, then, elze));
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
    return this.assignment();
  }

  assignment(): ast.Expr {
    const expr = this.or();

    if (this.next(TokenKind.Eq)) {
      const eq = this.advance();
      const val = this.assignment();

      if (expr.kind === ast.ExprKind.Var) {
        const name = (expr.body as ast.ExprVar).name;
        return new ast.Expr(
          ast.ExprKind.Assign,
          new ast.ExprAssign(name, val)
        );
      } else if (expr.kind === ast.ExprKind.Get) {
        const body = expr.body as ast.ExprGet;
        return new ast.Expr(
          ast.ExprKind.Set,
          new ast.ExprSet(body.object, body.token, val)
        );
      }

      reportParserError(new ParserError(eq, "Invalid assignment target."));
    }

    return expr;
  }

  or(): ast.Expr {
    let expr = this.and();

    while (this.next(TokenKind.Or)) {
      const operator = this.advance();
      const right = this.and();
      expr = new ast.Expr(
        ast.ExprKind.Logical,
        new ast.ExprLogical(expr, right, operator)
      );
    }

    return expr;
  }

  and(): ast.Expr {
    let expr = this.equality();

    while (this.next(TokenKind.And)) {
      const operator = this.advance();
      const right = this.expression();
      expr = new ast.Expr(
        ast.ExprKind.Logical,
        new ast.ExprLogical(expr, right, operator)
      );
    }

    return expr;
  }

  equality(): ast.Expr {
    let expr = this.comparison();

    while (this.next(TokenKind.BangEq, TokenKind.EqEq)) {
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

    const { Greater, GreaterEq, Less, LessEq } = TokenKind;
    while (this.next(Greater, GreaterEq, Less, LessEq)) {
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

    return this.call();
  }

  call(): ast.Expr {
    let expr = this.primary();

    for (;;) {
      if (this.next(TokenKind.LParen)) {
        this.advance();
        expr = this.finishCall(expr);
      } else if (this.next(TokenKind.Dot)) {
        this.advance();
        const token = this.consume(
          TokenKind.Ident,
          "Expect property name after '.'."
        );
        expr = new ast.Expr(ast.ExprKind.Get, new ast.ExprGet(expr, token));
      } else {
        break;
      }
    }

    return expr;
  }

  finishCall(callee: ast.Expr): ast.Expr {
    const args: ast.Expr[] = [];

    if (!this.next(TokenKind.RParen)) {
      for (;;) {
        if (args.length >= 255) {
          reportParserError(
            new ParserError(this.peek(), "Can't have more than 255 arguments.")
          );
        }

        args.push(this.expression());

        if (!this.next(TokenKind.Comma)) break;

        this.advance();
      }
    }

    const paren = this.consume(
      TokenKind.RParen,
      "Expect ')' after arguments."
    );

    return new ast.Expr(
      ast.ExprKind.Call,
      new ast.ExprCall(callee, args, paren)
    );
  }

  primary(): ast.Expr {
    if (this.next(TokenKind.LParen)) {
      this.advance();
      const expr = this.expression();
      this.consume(TokenKind.RParen, "Expect ')' after expression.");
      return new ast.Expr(ast.ExprKind.Group, new ast.ExprGroup(expr));
    }

    if (this.next(TokenKind.False)) {
      this.advance();
      return new ast.Expr(ast.ExprKind.Lit, new ast.ExprLit(false));
    }

    if (this.next(TokenKind.True)) {
      this.advance();
      return new ast.Expr(ast.ExprKind.Lit, new ast.ExprLit(true));
    }

    if (this.next(TokenKind.Nil)) {
      this.advance();
      return new ast.Expr(ast.ExprKind.Lit, new ast.ExprLit(null));
    }

    if (this.next(TokenKind.Num, TokenKind.Str)) {
      return new ast.Expr(
        ast.ExprKind.Lit,
        new ast.ExprLit(this.advance().lit)
      );
    }

    if (this.next(TokenKind.Ident)) {
      return new ast.Expr(
        ast.ExprKind.Var,
        new ast.ExprVar(this.advance())
      );
    }

    if (this.next(TokenKind.This)) {
      return new ast.Expr(
        ast.ExprKind.This,
        new ast.ExprThis(this.advance())
      );
    }

    if (this.next(TokenKind.Super)) {
      const kwd = this.advance();
      this.consume(TokenKind.Dot, "Expect '.' after 'super'.");
      const method = this.consume(
        TokenKind.Ident,
        "Expect parent class method name."
      );

      return new ast.Expr(ast.ExprKind.Super, new ast.ExprSuper(kwd, method));
    }

    throw new ParserError(this.peek(), "Expected expression.");
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
          TokenKind.Ret
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

export class ParserError extends Error {
  constructor(public token: Token, msg: string) {
    super(msg);
  }
}
