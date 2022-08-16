import { Token } from "./token.js";

export {
  Expr,
  ExprKind,
  ExprUnary,
  ExprBinary,
  ExprLit,
  ExprGroup,
  ExprVar,
  ExprAssign,
  ExprLogical,

  Stmt,
  StmtVar,
  StmtKind,
  StmtExpr,
  StmtPrint,
  StmtBlock,
  StmtIf,
  StmtWhile
};

enum ExprKind {
  Lit = 0,
  Unary,
  Binary,
  Group,
  Var,
  Assign,
  Logical,

  Count
}

class Expr {
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
  ) {}
}

class ExprLit {
  constructor(
      // @TODO(art): extract type?
      public value: Token|number|string|boolean|null
  ) {}
}

class ExprUnary {
  constructor(
      public right: Expr,
      public operator: Token
  ) {}
}

class ExprBinary {
  constructor(
      public left: Expr,
      public right: Expr,
      public operator: Token
  ) {}
}

class ExprGroup {
  constructor(public expr: Expr) {}
}

class ExprVar {
  constructor(public name: Token) {}
}

class ExprAssign {
  constructor(
      public name: Token,
      public value: Expr
  ) {}
}

class ExprLogical {
  constructor(
      public left: Expr,
      public right: Expr,
      public operator: Token
  ) {}
}

enum StmtKind {
  Expr = 0,
  Print,
  Var,
  Block,
  If,
  While,

  Count
}

class Stmt {
  constructor(
      public kind: StmtKind,
      public body:
        |StmtExpr
        |StmtPrint
        |StmtVar
        |StmtBlock
        |StmtIf
        |StmtWhile
  ) {}
}

class StmtExpr {
  constructor(public expr: Expr) {}
}

class StmtPrint {
  constructor(public expr: Expr) {}
}

class StmtVar {
  constructor(
      public name: Token,
      public initializer: Expr|null
  ) {}
}

class StmtBlock {
  constructor(public ss: Stmt[]) {}
}

class StmtIf {
  constructor(
      public cond: Expr,
      public then: Stmt,
      public elze: Stmt|null
  ) {}
}

class StmtWhile {
  constructor(
      public cond: Expr,
      public body: Stmt
  ) {}
}
