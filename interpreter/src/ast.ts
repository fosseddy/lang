import { Token } from "./token.js";

export {
  Expr,
  ExprKind,
  ExprUnary,
  ExprBinary,
  ExprLit,
  ExprGroup,
  ExprVar,

  Stmt,
  StmtVar,
  StmtKind,
  StmtExpr,
  StmtPrint
};

enum ExprKind {
  Lit = 0,
  Unary,
  Binary,
  Group,
  Var,

  Count
}

class Expr {
  constructor(
      public kind: ExprKind,
      public body: ExprLit|ExprUnary|ExprBinary|ExprGroup|ExprVar
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

enum StmtKind {
  Expr = 0,
  Print,
  Var,

  Count
}

class Stmt {
  constructor(
      public kind: StmtKind,
      public body: StmtExpr|StmtPrint|StmtExpr|StmtVar
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
