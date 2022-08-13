import { Token } from "./token.js";

export type Expr = {
  kind: ExprKind;
  body: ExprLiteral|ExprUnary|ExprBinary|ExprGrouping;
}

export enum ExprKind {
  Literal = 0,
  Unary,
  Binary,
  Grouping,

  Count
}

export type ExprLiteral = {
  value: number|string|boolean|null;
}

export type ExprUnary = {
  right: Expr;
  operator: Token;
}

export type ExprBinary = {
  left: Expr;
  right: Expr;
  operator: Token;
}

export type ExprGrouping = {
  expr: Expr;
}
