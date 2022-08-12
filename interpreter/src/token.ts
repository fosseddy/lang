export enum TokenKind {
  LeftParen = 0,
  RightParen,
  LeftBrace,
  RightBrace,
  Comma,
  Dot,
  Minus,
  Plus,
  Semicolon,
  Slash,
  Star,

  Bang,
  BangEqual,
  Equal,
  EqualEqual,
  Greater,
  GreateEqual,
  Less,
  LessEqual,

  Identifier,
  String,
  Number,

  And,
  Class,
  Else,
  False,
  Fun,
  For,
  If,
  Nil,
  Or,
  Print,
  Return,
  Super,
  This,
  True,
  Var,
  While,

  Eof,

  Count
}

export type Token = {
  kind: TokenKind;
  lexeme: string;
  literal: number|string|null;
  line: number;
}

export const keywords: Record<string, TokenKind> = {
  and: TokenKind.And,
  class: TokenKind.Class,
  else: TokenKind.Else,
  false: TokenKind.False,
  for: TokenKind.For,
  fun: TokenKind.Fun,
  if: TokenKind.If,
  nil: TokenKind.Nil,
  or: TokenKind.Or,
  print: TokenKind.Print,
  return: TokenKind.Return,
  super: TokenKind.Super,
  this: TokenKind.This,
  true: TokenKind.True,
  var: TokenKind.Var,
  while: TokenKind.While
};
