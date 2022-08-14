import { Token } from "./token.js";

export { Expr, ExprKind, ExprLiteral, ExprUnary, ExprBinary, ExprGrouping };

type Expr = {
  kind: ExprKind;
  body: ExprLiteral|ExprUnary|ExprBinary|ExprGrouping;
}

enum ExprKind {
  Literal = 0,
  Unary,
  Binary,
  Grouping,

  Count
}

type ExprLiteral = {
  value: number|string|boolean|null;
}

type ExprUnary = {
  right: Expr;
  operator: Token;
}

type ExprBinary = {
  left: Expr;
  right: Expr;
  operator: Token;
}

type ExprGrouping = {
  expr: Expr;
}
