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

  Stmt,
  StmtVar,
  StmtKind,
  StmtExpr,
  StmtPrint,
  StmtBlock,
};

enum ExprKind {
  Lit = 0,
  Unary,
  Binary,
  Group,
  Var,
  Assign,

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
  ) {}
}

class ExprLit {
  constructor(public value: Token|number|string|boolean|null) {}
}

class ExprUnary {
  constructor(public right: Expr, public operator: Token) {}
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
  constructor(public name: Token, public value: Expr) {}
}

enum StmtKind {
  Expr = 0,
  Print,
  Var,
  Block,

  Count
}

class Stmt {
  constructor(
      public kind: StmtKind,
      public body:
        |StmtExpr
        |StmtPrint
        |StmtExpr
        |StmtVar
        |StmtBlock
  ) {}
}

class StmtExpr {
  constructor(public expr: Expr) {}
}

class StmtPrint {
  constructor(public expr: Expr) {}
}

class StmtVar {
  constructor(public name: Token, public initializer: Expr|null) {}
}

class StmtBlock {
  constructor(public ss: Stmt[]) {}
}
