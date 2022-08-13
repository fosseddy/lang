import { Token, TokenKind } from "./token.js";
import { Expr } from "./ast.js";

type Parser = {
  tokens: Token[];
  current: number;
}

function parseExpr(p: Parser): Expr {
  return parseEquality(p);
}

function parseEquality(p: Parser): Expr {
  let expr: Expr = parseComparison(p);

  while (match(TokenKind.BangEqual, TokenKind.EqualEqual)) {
    const operator: Token = previous();
    const right: Expr = parseComparison(p);
    expr = { left: expr, operator, right };
  }

  return expr;
}
