import assert from "assert";
import { Interpreter } from "./interpreter.js";
import { Token } from "./token.js";
import * as ast from "./ast.js";
import { reportError } from "./main.js";

enum FunKind {
  None = 0,
  Fun,

  Count
}

export class Resolver {
  scopes: Array<Map<string, boolean>> = [];
  currFunKind = FunKind.None;

  constructor(public interp: Interpreter) {}

  resolve(ss: ast.Stmt[]): void {
    for (const s of ss) {
      this.resolveStmt(s);
    }
  }

  resolveStmt(s: ast.Stmt): void {
    switch (s.kind) {
    case ast.StmtKind.Block: {
      const body = s.body as ast.StmtBlock;
      this.beginScope();
      this.resolve(body.ss);
      this.endScope();
    } break;

    case ast.StmtKind.Var: {
      const body = s.body as ast.StmtVar;
      this.declare(body.name);
      if (body.initializer) {
        this.resolveExpr(body.initializer);
      }
      this.define(body.name);
    } break;

    case ast.StmtKind.Fun: {
      const body = s.body as ast.StmtFun;
      this.declare(body.name);
      this.define(body.name);

      this.resolveFun(body, FunKind.Fun);
    } break;

    case ast.StmtKind.Expr: {
      const body = s.body as ast.StmtExpr;
      this.resolveExpr(body.expr);
    } break;

    case ast.StmtKind.If: {
      const body = s.body as ast.StmtIf;
      this.resolveExpr(body.cond);
      this.resolveStmt(body.then);
      if (body.elze) this.resolveStmt(body.elze);
    } break;

    case ast.StmtKind.Print: {
      const body = s.body as ast.StmtPrint;
      this.resolveExpr(body.expr);
    } break;

    case ast.StmtKind.Ret: {
      const body = s.body as ast.StmtRet;
      if (this.currFunKind === FunKind.None) {
        reportError(body.token.line, "Can't return from top-level code");
      }
      if (body.value) this.resolveExpr(body.value);
    } break;

    case ast.StmtKind.While: {
      const body = s.body as ast.StmtWhile;
      this.resolveExpr(body.cond);
      this.resolveStmt(body.body);
    } break;

    default: assert(false);
    }
  }

  resolveExpr(e: ast.Expr): void {
    switch (e.kind) {
    case ast.ExprKind.Var: {
      const body = e.body as ast.ExprVar;
      if (this.scopes.length &&
          this.scopes.at(-1)!.get(body.name.lex) === false
      ) {
        reportError(
          body.name.line,
          "Can't read local variable in its own initializer."
        );
      }

      this.resolveLocalExpr(e, body.name);
    } break;

    case ast.ExprKind.Assign: {
      const body = e.body as ast.ExprAssign;
      this.resolveExpr(body.value);
      this.resolveLocalExpr(e, body.name);
    } break;

    case ast.ExprKind.Binary: {
      const body = e.body as ast.ExprBinary;
      this.resolveExpr(body.left);
      this.resolveExpr(body.right);
    } break;

    case ast.ExprKind.Call: {
      const body = e.body as ast.ExprCall;
      this.resolveExpr(body.callee);
      for (const a of body.args) {
        this.resolveExpr(a);
      }
    } break;

    case ast.ExprKind.Group: {
      const body = e.body as ast.ExprGroup;
      this.resolveExpr(body.expr);
    } break;

    case ast.ExprKind.Logical: {
      const body = e.body as ast.ExprLogical;
      this.resolveExpr(body.left);
      this.resolveExpr(body.right);
    } break;

    case ast.ExprKind.Unary: {
      const body = e.body as ast.ExprUnary;
      this.resolveExpr(body.right);
    } break;

    case ast.ExprKind.Lit: break;

    default: assert(false);
    }
  }

  resolveLocalExpr(e: ast.Expr, t: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes.at(i)!.has(t.lex)) {
        this.interp.resolve(e, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  resolveFun(s: ast.StmtFun, kind: FunKind): void {
    const prevFunKind = this.currFunKind;
    this.currFunKind = kind;

    this.beginScope();
    for (const t of s.params) {
      this.declare(t);
      this.define(t);
    }
    this.resolve(s.body);
    this.endScope();

    this.currFunKind = prevFunKind;
  }

  beginScope(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  endScope(): void {
    this.scopes.pop();
  }

  declare(t: Token): void {
    if (!this.scopes.length) return;

    const scope = this.scopes.at(-1)!
    if (scope.has(t.lex)) {
      reportError(
        t.line,
        "Variable with this name in this scope already exist"
      );
    }

    scope.set(t.lex, false);
  }

  define(t: Token): void {
    if (!this.scopes.length) return;
    this.scopes.at(-1)!.set(t.lex, true);
  }
}
