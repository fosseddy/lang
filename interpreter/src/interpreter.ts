import assert from "assert";
import * as ast from "./ast.js";
import { Token, TokenKind } from "./token.js";
import { reportRuntimeError } from "./main.js";

export class Interpreter {
  locals = new Map<ast.Expr, number>();
  globals = new Env();
  env = this.globals;

  constructor() {
    this.globals.define("clock", new NativeFun((): number => Date.now(), 0));
  }

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
      this.executeBlock(body.ss, new Env(this.env));
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

    case ast.StmtKind.Fun: {
      const body = s.body as ast.StmtFun;
      const fun = new Fun(body, this.env, false);
      this.env.define(body.name.lex, fun);
    } break;

    case ast.StmtKind.Ret: {
      const body = s.body as ast.StmtRet;
      let value: TT = null;
      if (body.value !== null) value = this.evaluate(body.value);

      throw new Return(value);
    } break;

    case ast.StmtKind.Class: {
      const body = s.body as ast.StmtClass;
      let parent: Klass|null = null;
      if (body.parent) {
        const p = body.parent.body as ast.ExprVar;
        parent = this.evaluate(body.parent);
        if (!(parent instanceof Klass)) {
          throw new RuntimeError(p.name, "Parent must be a class.");
        }
      }
      this.env.define(body.token.lex, null);

      if (parent) {
        this.env = new Env(this.env);
        this.env.define("super", parent);
      }

      const methods = new Map<string, Fun>();
      for (const methodExpr of body.methods) {
        const m = methodExpr.body as ast.StmtFun;
        const fn = new Fun(m, this.env, m.name.lex === "init");
        methods.set(m.name.lex, fn);
      }
      const klass = new Klass(body.token.lex, methods, parent);

      if (parent) {
        assert(this.env.enclosing);
        this.env = this.env.enclosing;
      }

      this.env.assign(body.token, klass);
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
      return this.lookUpVar(body.name, expr);
    }

    case ast.ExprKind.Assign: {
      const body = expr.body as ast.ExprAssign;
      const value = this.evaluate(body.value);
      const depth = this.locals.get(expr);
      if (depth != null) {
        this.env.assignAt(depth, body.name, value);
      } else {
        this.globals.assign(body.name, value)
      }
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

      if (!callee.invoke) {
        throw new RuntimeError(
          body.paren,
          "Can only call functions and classes."
        );
      }

      const args: unknown[] = [];
      for (const a of body.args) {
        args.push(this.evaluate(a));
      }

      if (callee.arity !== args.length) {
        throw new RuntimeError(
          body.paren,
          `Expected ${callee.arity} arguments but got ${args.length}.`
        );
      }

      return callee.invoke(this, args);
    }

    case ast.ExprKind.Get: {
      const body = expr.body as ast.ExprGet;

      const obj: TT = this.evaluate(body.object);
      if (obj instanceof Instance) {
        return obj.get(body.token);
      }

      throw new RuntimeError(body.token, "Only instances have properties.");
    }

    case ast.ExprKind.Set: {
      const body = expr.body as ast.ExprSet;

      const obj: TT = this.evaluate(body.object);
      if (!(obj instanceof Instance)) {
        throw new RuntimeError(body.token, "Only instances have fields.");
      }

      const val = this.evaluate(body.value);
      obj.set(body.token, val);

      return val;
    }

    case ast.ExprKind.This: {
      const body = expr.body as ast.ExprThis;

      return this.lookUpVar(body.kwd, expr);
    }

    case ast.ExprKind.Super: {
      const body = expr.body as ast.ExprSuper;
      const depth = this.locals.get(expr);
      assert(depth != null);

      const parent = this.env.getAt(depth, "super");
      assert(parent != null);
      assert(parent instanceof Klass);

      const obj = this.env.getAt(depth - 1, "this");
      assert(obj instanceof Instance);

      const method = parent.findMethod(body.method.lex);

      if (!method) {
        throw new RuntimeError(
          body.method,
          `Undefined property '${body.method.lex}'.`
        );
      }

      return method.bind(obj);
    }

    default: assert(false);
    }
  }

  executeBlock(ss: ast.Stmt[], env: Env) {
    const prev = this.env;
    try {
      this.env = env;
      for (const s of ss) {
        this.execute(s);
      }
    } finally {
      this.env = prev;
    }
  }


  lookUpVar(t: Token, e: ast.Expr): TT {
    const depth = this.locals.get(e);
    if (depth != null) {
      return this.env.getAt(depth, t.lex);
    }

    return this.globals.get(t);
  }

  resolve(e: ast.Expr, depth: number): void {
    this.locals.set(e, depth);
  }
}

// @TODO(art): Typing
type Lit = number|string|boolean|null
type TT = Lit|Callable|Instance
type InvokeFun = (i: Interpreter, args: unknown[]) => unknown;
type Callable = {
  arity: number;
  invoke: InvokeFun;
}

class NativeFun {
  constructor(public fn: InvokeFun, public arity: number) {}

  invoke(i: Interpreter, args: unknown[]): unknown {
    return this.fn(i, args);
  }

  toString(): string {
    return "<native fun>";
  }
}

class Fun {
  arity: number;

  constructor(
      public decl: ast.StmtFun,
      public closure: Env,
      public isInit: boolean
  ) {
    this.arity = this.decl.params.length;
  }

  invoke(i: Interpreter, args: unknown[]): TT { // @TODO(art): typing
    const env = new Env(this.closure);
    for (let i = 0; i < this.decl.params.length; i++) {
      const tok = this.decl.params[i];
      assert(tok != null);
      env.define(tok.lex, args[i] as TT); // @TODO(art): typing
    }

    try {
      i.executeBlock(this.decl.body, env);
    } catch (err) {
      if (err instanceof Return) {
        if (this.isInit) return this.closure.getAt(0, "this");
        return err.value;
      } else {
        throw err;
      }
    }

    if (this.isInit) return this.closure.getAt(0, "this");

    return null;
  }

  bind(inst: Instance): Fun {
    const env = new Env(this.closure);
    env.define("this", inst);
    return new Fun(this.decl, env, this.isInit);
  }

  toString(): string {
    return `<fun ${this.decl.name.lex}>`;
  }
}

class Klass {
  arity = 0;

  constructor(
      public name: string,
      public methods: Map<string, Fun>,
      public parent: Klass|null
  ) {}

  invoke(i: Interpreter, args: unknown[]): Instance {
    const inst = new Instance(this);
    const init = this.findMethod("init");

    if (init) {
      this.arity = init.arity;
      init.bind(inst).invoke(i, args);
    }

    return inst;
  }

  findMethod(name: string): Fun|null {
    let m = this.methods.get(name);
    if (m) return m;

    if (this.parent) {
      return this.parent.findMethod(name);
    }

    return null;
  }

  toString(): string {
    return this.name;
  }
}

class Instance {
  fields = new Map<String, TT>();

  constructor(public klass: Klass) {}

  get(name: Token): TT {
    if (this.fields.has(name.lex)) {
      return this.fields.get(name.lex)!;
    }

    const m = this.klass.findMethod(name.lex);
    if (m) return m.bind(this);

    throw new RuntimeError(name, `Undefined property '${name.lex}'.`);
  }

  set(name: Token, value: TT): void {
    this.fields.set(name.lex, value);
  }

  toString(): string {
    return `${this.klass.name} instance`;
  }
}

class Env {
  values = new Map<string, TT>();

  constructor(public enclosing: Env|null = null) {}

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

  getAt(depth: number, lex: string): TT {
    return this.ancestor(depth).values.get(lex)!;
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

  assignAt(depth: number, name: Token, value: TT): void {
    this.ancestor(depth).values.set(name.lex, value);
  }

  ancestor(depth: number): Env {
    let env: Env = this;
    for (let i = 0; i < depth; i++) {
      assert(env != null);
      assert(env.enclosing != null);
      env = env.enclosing;
    }
    return env;
  }
}

class Return extends Error {
  constructor(public value: TT) {
    super("");
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
