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
  //literal: Object;
  line: number;
}

export function createToken(kind: TokenKind, lexeme: string,
                            /*literal: ???,*/ line: number): Token {
  return Object.create(token, {
    kind: { value: kind },
    lexeme: { value: lexeme },
    //literal: { value: literal },
    line: { value: line }
  });
}

const token: Token = {
  kind: -1,
  line: -1,
  lexeme: "",
  //literal: ???
};

token.toString = function(): string {
  //return `${t.kind} ${t.lexeme} ${t.literal}`;
  return `${this.kind} ${this.lexeme}`;
}
