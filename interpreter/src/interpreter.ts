import assert from "assert";
import * as ast from "./ast.js";
import { Token, TokenKind } from "./token.js";
import { reportRuntimeError } from "./main.js";

export { Interpreter, RuntimeError };

class Interpreter {
  env = new Env();

  interpret(ss: ast.Stmt[]): void {
    try {
      for (const s of ss) {
        this.execute(s);
      }
    } catch (err) {
      if (err instanceof RuntimeError) {
        reportRuntimeError(err);
      } else {
        console.error("Unknown Interpreter Error:", err);
        process.exit(1);
      }
    }
  }

  execute(s: ast.Stmt): void {
    switch (s.kind) {
    case ast.StmtKind.Expr: {
      const body = s.body as ast.StmtExpr;
      this.evaluate(body.expr);
    } break;

    case ast.StmtKind.Print: {
      const body = s.body as ast.StmtPrint;
      const value = this.evaluate(body.expr);
      process.stdout.write(String(value));
      process.stdout.write("\n");
    } break;

    case ast.StmtKind.Var: {
      const body = s.body as ast.StmtVar;

      let value: Lit = null;
      if (body.initializer) value = this.evaluate(body.initializer);

      this.env.define(body.name.lex, value);
    } break;

    case ast.StmtKind.Block: {
      const body = s.body as ast.StmtBlock;
      const prev = this.env;
      try {
        this.env = new Env(this.env);
        for (const s of body.ss) {
          this.execute(s);
        }
      } finally {
        this.env = prev;
      }
    } break;

    case ast.StmtKind.If: {
      const body = s.body as ast.StmtIf;
      if (isTruthy(this.evaluate(body.cond))) {
        this.execute(body.then);
      } else if (body.elze) {
        this.execute(body.elze);
      }
    } break;

    default: assert(false);
    }
  }

  // @TODO(art): Typing
  evaluate(expr: ast.Expr): any {
    switch (expr.kind) {
    case ast.ExprKind.Lit: {
      const body = expr.body as ast.ExprLit;
      return body.value;
    }

    case ast.ExprKind.Unary: {
      const body = expr.body as ast.ExprUnary;
      const right = this.evaluate(body.right);

      switch (body.operator.kind) {
      case TokenKind.Minus: return -right; // @TODO(art): check for numbers only?
      case TokenKind.Bang: return !isTruthy(right);
      default: assert(false);
      }
    }

    case ast.ExprKind.Binary: {
      const body = expr.body as ast.ExprBinary;
      const left = this.evaluate(body.left);
      const right = this.evaluate(body.right);

      switch (body.operator.kind) {
      case TokenKind.Plus: return left + right;
      case TokenKind.Minus: return left - right;
      case TokenKind.Slash: return left / right;
      case TokenKind.Star: return left * right;
      case TokenKind.Greater: return left > right;
      case TokenKind.GreaterEq: return left >= right;
      case TokenKind.Less: return left < right;
      case TokenKind.LessEq: return left <= right;
      case TokenKind.BangEq: return !isEqual(left, right);
      case TokenKind.EqEq: return isEqual(left, right);
      default: assert(false);
      }
    }

    case ast.ExprKind.Group: {
      const body = expr.body as ast.ExprGroup;
      return this.evaluate(body.expr);
    }

    case ast.ExprKind.Var: {
      const body = expr.body as ast.ExprVar;
      return this.env.get(body.name);
    }

    case ast.ExprKind.Assign: {
      const body = expr.body as ast.ExprAssign;
      const value = this.evaluate(body.value);
      this.env.assign(body.name, value)
      return value;
    }

    default: assert(false);
    }
  }
}

type Lit = number|string|boolean|null

class Env {
  values = new Map<string, Lit>();

  enclosing: Env|null;

  constructor(e: Env|null = null) {
    this.enclosing = e;
  }

  define(name: string, value: Lit): void {
    this.values.set(name, value);
  }

  get(name: Token): Lit {
    const val = this.values.get(name.lex);
    if (val !== undefined) {
      return val;
    }

    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, `Undefined variable '${name.lex}'.`);
  }

  assign(name: Token, value: Lit): void {
    if (this.values.has(name.lex)) {
      this.values.set(name.lex, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lex}'.`);
  }
}

class RuntimeError extends Error {
  token: Token;

  constructor(t: Token, msg: string) {
    super(msg);
    this.token = t;
  }
}

function isTruthy(val: Lit): boolean {
  if (val == null) return false;
  if (typeof val === "boolean") return val;

  return true;
}

function isEqual(a: Lit, b: Lit): boolean {
    if (a == null && b == null) return true;

    if (typeof a === "number" && typeof b === "number") {
      if (isNaN(a) && isNaN(b)) return true;
    }

    return a === b;
  }
