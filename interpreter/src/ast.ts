import { Token } from "./token.js";

export enum ExprKind {
  Lit = 0,
  Unary,
  Binary,
  Group,
  Var,
  Assign,
  Logical,
  Call,

  Count
}

export class Expr {
  constructor(
      public kind: ExprKind,
      public body:
        |ExprLit
        |ExprUnary
        |ExprBinary
        |ExprGroup
        |ExprVar
        |ExprAssign
        |ExprLogical
        |ExprCall
  ) {}
}

export class ExprLit {
  constructor(
      // @TODO(art): extract type?
      public value: Token|number|string|boolean|null
  ) {}
}

export class ExprUnary {
  constructor(
      public right: Expr,
      public operator: Token
  ) {}
}

export class ExprBinary {
  constructor(
      public left: Expr,
      public right: Expr,
      public operator: Token
  ) {}
}

export class ExprGroup {
  constructor(public expr: Expr) {}
}

export class ExprVar {
  constructor(public name: Token) {}
}

export class ExprAssign {
  constructor(
      public name: Token,
      public value: Expr
  ) {}
}

export class ExprLogical {
  constructor(
      public left: Expr,
      public right: Expr,
      public operator: Token
  ) {}
}

export class ExprCall {
  constructor(
      public callee: Expr,
      public args: Expr[],
      public paren: Token
  ) {}
}

export enum StmtKind {
  Expr = 0,
  Print,
  Var,
  Block,
  If,
  While,
  Fun,

  Count
}

export class Stmt {
  constructor(
      public kind: StmtKind,
      public body:
        |StmtExpr
        |StmtPrint
        |StmtVar
        |StmtBlock
        |StmtIf
        |StmtWhile
        |StmtFun
  ) {}
}

export class StmtExpr {
  constructor(public expr: Expr) {}
}

export class StmtPrint {
  constructor(public expr: Expr) {}
}

export class StmtVar {
  constructor(
      public name: Token,
      public initializer: Expr|null
  ) {}
}

export class StmtBlock {
  constructor(public ss: Stmt[]) {}
}

export class StmtIf {
  constructor(
      public cond: Expr,
      public then: Stmt,
      public elze: Stmt|null
  ) {}
}

export class StmtWhile {
  constructor(
      public cond: Expr,
      public body: Stmt
  ) {}
}

export class StmtFun {
  constructor(
      public name: Token,
      public params: Token[],
      public body: Stmt[]
  ) {}
}
