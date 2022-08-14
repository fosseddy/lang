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

      this.env.define(body.name.lexeme, value);
    } break;

    default: assert(false);
    }
  }

  // @TODO(art): Typing
  evaluate(expr: ast.Expr): any {
    switch (expr.kind) {
    case ast.ExprKind.Literal: {
      const body = expr.body as ast.ExprLiteral;
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
      case TokenKind.GreateEqual: return left >= right;
      case TokenKind.Less: return left < right;
      case TokenKind.LessEqual: return left <= right;
      case TokenKind.BangEqual: return !isEqual(left, right);
      case TokenKind.EqualEqual: return isEqual(left, right);
      default: assert(false);
      }
    }

    case ast.ExprKind.Grouping: {
      const body = expr.body as ast.ExprGrouping;
      return this.evaluate(body.expr);
    }

    case ast.ExprKind.Variable: {
      const body = expr.body as ast.ExprVariable;
      return this.env.get(body.name);
    }

    default: assert(false);
    }
  }
}

type Lit = number|string|boolean|null

class Env {
  values = new Map<string, Lit>();

  define(name: string, value: Lit): void {
    this.values.set(name, value);
  }

  get(name: Token): Lit {
    const val = this.values.get(name.lexeme);
    if (val === undefined) {
      throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }
    return val;
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
