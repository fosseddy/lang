import assert from "assert";
import * as ast from "./ast.js";
import { Token, TokenKind } from "./token.js";
import { reportRuntimeError } from "./main.js";

export class Interpreter {
  globals = new Env();
  env = this.globals;

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
    // @TODO(art): rename body variable
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

    case ast.StmtKind.While: {
      const body = s.body as ast.StmtWhile;
      while (isTruthy(this.evaluate(body.cond))) {
        this.execute(body.body);
      }
    } break;

    default: assert(false);
    }
  }

  // @TODO(art): Typing
  evaluate(expr: ast.Expr): any {
    // @TODO(art): rename body variable
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

    case ast.ExprKind.Logical: {
      const body = expr.body as ast.ExprLogical;
      const left = this.evaluate(body.left);

      if (body.operator.kind === TokenKind.Or) {
        if (isTruthy(left)) return left;
      } else {
        assert(body.operator.kind === TokenKind.And);
        if (!isTruthy(left)) return left;
      }

      return this.evaluate(body.right);
    }

    case ast.ExprKind.Call: {
      const body = expr.body as ast.ExprCall;
      const callee = this.evaluate(body.callee) as Callable;

      // @TODO(art): typing
      const args: any = [];
      for (const a of body.args) {
        args.push(this.evaluate(a));
      }

      if (!(callee instanceof Callable)) {
        throw new RuntimeError(
          body.paren,
          "Can only call functions and classes."
        );
      }

      if (callee.arity !== args.length) {
        throw new RuntimeError(
          body.paren,
          `Expected ${callee.arity} arguments but got ${args.length}.`
        );
      }

      return callee.invoke(this, args);
    }

    default: assert(false);
    }
  }
}

class Callable {
  constructor(
      public arity: number,
      public invoke: (i: Interpreter, args: unknown[]) => unknown
  ) {}
}

// @TODO(art): Typing
type Lit = number|string|boolean|null
type TT = Lit|Callable

class Env {
  values = new Map<string, TT>();

  enclosing: Env|null;

  constructor(e: Env|null = null) {
    this.enclosing = e;
  }

  define(name: string, value: TT): void {
    this.values.set(name, value);
  }

  get(name: Token): TT {
    const val = this.values.get(name.lex);
    if (val !== undefined) {
      return val;
    }

    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name, `Undefined variable '${name.lex}'.`);
  }

  assign(name: Token, value: TT): void {
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

export class RuntimeError extends Error {
  constructor(public token: Token, msg: string) {
    super(msg);
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
