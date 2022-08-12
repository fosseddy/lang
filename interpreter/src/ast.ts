import { Token, TokenKind } from "./token.js";

type Expr = ExprLiteral|ExprUnary|ExprBinary|ExprGrouping

type ExprLiteral = {
  value: number|string;
}

type ExprUnary = {
  operator: Token;
  right: Expr;
}

type ExprBinary = {
  left: Expr;
  operator: Token;
  right: Expr;
}

type ExprGrouping = {
  expr: Expr;
}
