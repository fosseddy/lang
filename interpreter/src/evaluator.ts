import assert from "assert";
import * as ast from "./ast.js";
import { TokenKind } from "./token.js";

export { evaluate };

function evaluate(expr: ast.Expr): any {
  switch (expr.kind) {
  case ast.ExprKind.Literal: {
    const body = expr.body as ast.ExprLiteral;
    return body.value;
  }

  case ast.ExprKind.Unary: {
    const body = expr.body as ast.ExprUnary;
    const right = evaluate(body.right);

    switch (body.operator.kind) {
    case TokenKind.Minus: return -right; // @TODO(art): check for numbers only?
    case TokenKind.Bang: return !isTruthy(right);
    default: assert(false);
    }
  }

  case ast.ExprKind.Binary: {
    const body = expr.body as ast.ExprBinary;
    const left = evaluate(body.left);
    const right = evaluate(body.right);

    switch (body.operator.kind) {
    case TokenKind.Plus: return left + right;
    case TokenKind.Minus: return left - right;
    case TokenKind.Slash: return left / right;
    case TokenKind.Star: return left * right;
    case TokenKind.Greater: return left > right;
    case TokenKind.GreateEqual: return left >= right;
    case TokenKind.Less: return left < right;
    case TokenKind.LessEqual: return left <= right;
    case TokenKind.BangEqual: return !isEqual(left, right);
    case TokenKind.EqualEqual: return isEqual(left, right);
    default: assert(false);
    }
  }

  case ast.ExprKind.Grouping: {
    const body = expr.body as ast.ExprGrouping;
    return evaluate(body.expr);
  }

  default: assert(false);
  }
}

type Lit = number|string|boolean|null

function isTruthy(val: Lit): boolean {
  if (val == null) return false;
  if (typeof val === "boolean") return val;

  return true;
}

function isEqual(a: Lit, b: Lit): boolean {
    if (a == null && b == null) return true;

    if (typeof a === "number" && typeof b === "number") {
      if (isNaN(a) && isNaN(b)) return true;
    }

    return a === b;
  }
