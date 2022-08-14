import { Token } from "./token.js";

export {
  Expr,
  ExprKind,
  ExprUnary,
  ExprBinary,
  ExprLiteral,
  ExprGrouping,

  Stmt,
  StmtKind,
  StmtExpr,
  StmtPrint
};

enum ExprKind {
  Literal = 0,
  Unary,
  Binary,
  Grouping,

  Count
}

class Expr {
  constructor(
      public kind: ExprKind,
      public body: ExprLiteral|ExprUnary|ExprBinary|ExprGrouping
  ) {}
}

class ExprLiteral {
  constructor(public value: number|string|boolean|null) {}
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

enum StmtKind {
  Expr = 0,
  Print,

  Count
}

class Stmt {
  constructor(
      public kind: StmtKind,
      public body: StmtExpr|StmtPrint
  ) {}
}

class StmtExpr {
  constructor(public expr: Expr) {}
}

class StmtPrint {
  constructor(public expr: Expr) {}
}
