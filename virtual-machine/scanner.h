#ifndef SCANNER_H
#define SCANNER_H

#include <stddef.h>

enum token_kind {
  TOKEN_LPAREN = 0,
  TOKEN_RPAREN,
  TOKEN_LBRACE,
  TOKEN_RBRACE,

  TOKEN_COMMA,
  TOKEN_DOT,
  TOKEN_MINUS,
  TOKEN_PLUS,
  TOKEN_SEMICOLON,
  TOKEN_SLASH,
  TOKEN_STAR,

  TOKEN_BANG,
  TOKEN_BANG_EQ,
  TOKEN_EQ,
  TOKEN_EQ_EQ,
  TOKEN_GREATER,
  TOKEN_GREATER_EQ,
  TOKEN_LESS,
  TOKEN_LESS_EQ,

  TOKEN_IDENT,
  TOKEN_STR,
  TOKEN_NUM,

  TOKEN_AND,
  TOKEN_CLASS,
  TOKEN_ELSE,
  TOKEN_FALSE,
  TOKEN_FUN,
  TOKEN_FOR,
  TOKEN_IF,
  TOKEN_NIL,
  TOKEN_OR,
  TOKEN_PRINT,
  TOKEN_RET,
  TOKEN_SUPER,
  TOKEN_THIS,
  TOKEN_TRUE,
  TOKEN_VAR,
  TOKEN_WHILE,

  TOKEN_ERR,
  TOKEN_EOF
};

struct token {
  enum token_kind kind;
  char *start;
  size_t len;
  size_t line;
};

void scanner_init(char *src);
struct token scanner_scan();

#endif
