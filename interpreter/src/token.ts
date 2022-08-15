export { Token, TokenKind, keywords };

enum TokenKind {
  LParen = 0,
  RParen,
  LBrace,
  RBrace,
  Comma,
  Dot,
  Minus,
  Plus,
  Semicolon,
  Slash,
  Star,

  Bang,
  BangEq,
  Eq,
  EqEq,
  Greater,
  GreaterEq,
  Less,
  LessEq,

  Ident,
  Str,
  Num,

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

const keywords = new Map<string, TokenKind>([
  ["and", TokenKind.And],
  ["class", TokenKind.Class],
  ["else", TokenKind.Else],
  ["false", TokenKind.False],
  ["for", TokenKind.For],
  ["fun", TokenKind.Fun],
  ["if", TokenKind.If],
  ["nil", TokenKind.Nil],
  ["or", TokenKind.Or],
  ["print", TokenKind.Print],
  ["return", TokenKind.Return],
  ["super", TokenKind.Super],
  ["this", TokenKind.This],
  ["true", TokenKind.True],
  ["var", TokenKind.Var],
  ["while", TokenKind.While]
]);

class Token {
  constructor(
      public kind: TokenKind,
      public lex: string,
      public lit: number|string|null,
      public line: number
  ) {}
}
