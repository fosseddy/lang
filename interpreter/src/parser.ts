import assert from "assert";
import { Token, TokenKind } from "./token.js";
import { Expr, ExprKind } from "./ast.js";
import { printParserError } from "./main.js";

export type Parser = {
  tokens: Token[];
  current: number;
}

export function parse(p: Parser): Expr {
  return expression(p);
}

function expression(p: Parser): Expr {
  return equality(p);
}

function equality(p: Parser): Expr {
  let expr: Expr = comparison(p);

  while (match(p, TokenKind.BangEqual, TokenKind.EqualEqual)) {
    const operator: Token = previous(p);
    const right: Expr = comparison(p);
    expr = {
      kind: ExprKind.Binary,
      body: {
        left: expr,
        right,
        operator
      }
    };
  }

  return expr;
}

function comparison(p: Parser): Expr {
  let expr: Expr = term(p);

  const { Greater, GreateEqual, Less, LessEqual } = TokenKind;
  while (match(p, Greater, GreateEqual, Less, LessEqual)) {
    const operator: Token = previous(p);
    const right: Expr = term(p);
    expr = {
      kind: ExprKind.Binary,
      body: {
        left: expr,
        right,
        operator
      }
    };
  }

  return expr;
}

function term(p: Parser): Expr {
  let expr: Expr = factor(p);

  const { Minus, Plus } = TokenKind;
  while (match(p, Minus, Plus)) {
    const operator: Token = previous(p);
    const right: Expr = factor(p);
    expr = {
      kind: ExprKind.Binary,
      body: {
        left: expr,
        right,
        operator
      }
    };
  }

  return expr;
}

function factor(p: Parser): Expr {
  let expr: Expr = unary(p);

  const { Slash, Star } = TokenKind;
  while (match(p, Slash, Star)) {
    const operator: Token = previous(p);
    const right: Expr = unary(p);
    expr = {
      kind: ExprKind.Binary,
      body: {
        left: expr,
        right,
        operator
      }
    };
  }

  return expr;
}

function unary(p: Parser): Expr {
  const { Bang, Minus } = TokenKind;
  while (match(p, Bang, Minus)) {
    const operator: Token = previous(p);
    const right: Expr = unary(p);
    return {
      kind: ExprKind.Unary,
      body: { right, operator }
    };
  }

  return primary(p);
}

function primary(p: Parser): Expr {
  const {
    False, True, Nil,
    Number, String,
    LeftParen, RightParen
  } = TokenKind;

  if (match(p, False)) {
    return { kind: ExprKind.Literal, body: { value: false } };
  }

  if (match(p, True)) {
    return { kind: ExprKind.Literal, body: { value: true } };
  }

  if (match(p, Nil)) {
    return { kind: ExprKind.Literal, body: { value: null } };
  }

  if (match(p, Number, String)) {
    return { kind: ExprKind.Literal, body: { value: previous(p).literal } };
  }

  if (match(p, LeftParen)) {
    const expr: Expr = expression(p);
    consume(p, RightParen, "Expect ')' after expression.");
    return { kind: ExprKind.Grouping, body: { expr } };
  }

  // @TODO(art): Proper error handling
  console.log(p);
  printParserError(peek(p), "Expected expression.");
  assert(false);
}

function consume(p: Parser, kind: TokenKind, msg: string): Token {
  if (check(p, kind)) return advance(p);
  // @TODO(art): Proper error handling
  printParserError(peek(p), msg);
  assert(false);
}

function match(p: Parser, ...tokens: TokenKind[]): boolean {
  for (const t of tokens) {
    if (check(p, t)) {
      advance(p);
      return true;
    }
  }

  return false;
}

function previous(p: Parser): Token {
  const t = p.tokens.at(p.current - 1);
  assert(t != undefined);

  return t;
}

function check(p: Parser, kind: TokenKind): boolean {
  if (!hasTokens(p)) return false;

  return peek(p).kind === kind;
}

function peek(p: Parser): Token {
  const t = p.tokens.at(p.current);
  assert(t != undefined);

  return t;
}

function hasTokens(p: Parser): boolean {
  return peek(p).kind !== TokenKind.Eof;
}

function advance(p: Parser): Token {
  if (hasTokens(p)) p.current++;
  return previous(p);
}
