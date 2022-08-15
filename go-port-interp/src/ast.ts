import { Token } from "./token.js";

export {
  Expr,
  ExprKind,
  ExprUnary,
  ExprBinary,
  ExprLiteral,
  ExprGrouping,
  ExprVariable,

  Stmt,
  StmtVar,
  StmtKind,
  StmtExpr,
  StmtPrint
};

enum ExprKind {
  Literal = 0,
  Unary,
  Binary,
  Grouping,
  Variable,

  Count
}

class Expr {
  constructor(
      public kind: ExprKind,
      public body: ExprLiteral|ExprUnary|ExprBinary|ExprGrouping|ExprVariable
  ) {}
}

class ExprLiteral {
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

class ExprGrouping {
  constructor(public expr: Expr) {}
}

class ExprVariable {
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
