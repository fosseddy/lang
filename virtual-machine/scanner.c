#include <stdio.h>
#include <stdbool.h>
#include <string.h>

#include "scanner.h"

struct scanner {
  char *start;
  char *current;
  size_t line;
};

static struct scanner scanner = {0};

static bool has_src()
{
  return *scanner.current != '\0';
}

static char advance()
{
  return *scanner.current++;
}

static char peek()
{
  return *scanner.current;
}

static char peek2()
{
  if (!has_src()) return '\0';
  return *(scanner.current + 1);
}

static bool next(char c)
{
  if (!has_src()) return false;
  return peek() == c;
}

static struct token make_token(enum token_kind kind)
{
  return (struct token) {
    .kind = kind,
    .start = scanner.start,
    .len = (size_t) (scanner.current - scanner.start),
    .line = scanner.line
  };
}

static struct token make_err_token(char *msg)
{
  return (struct token) {
    .kind = TOKEN_ERR,
    .start = msg,
    .len = strlen(msg),
    .line = scanner.line
  };
}

static void skip_whitespace() {
  for (;;) {
    char c = peek();
    switch(c) {
    case ' ':
    case '\r':
    case '\t':
      advance();
      break;

    case '\n':
      scanner.line++;
      advance();
      break;

    default:
      return;
    }
  }
}

static bool is_digit(char c)
{
  return c >= '0' && c <= '9';
}

static bool is_alpha(char c)
{
  return (c >= 'a' && c <= 'z') ||
         (c >= 'A' && c <= 'Z') ||
         c == '_';
}

static bool is_alphanum(char c)
{
  return is_alpha(c) || is_digit(c);
}

static enum token_kind check_kwd(size_t start,
                                 size_t len,
                                 char *rest,
                                 enum token_kind kind)
{
  if ((size_t) (scanner.current - scanner.start) == start + len &&
      memcmp(scanner.start + start, rest, len) == 0
  ) {
    return kind;
  }

  return TOKEN_IDENT;
}

static enum token_kind kwd_or_ident()
{
  switch (*scanner.start) {
  case 'a': return check_kwd(1, 2, "nd", TOKEN_AND);
  case 'c': return check_kwd(1, 4, "lass", TOKEN_CLASS);
  case 'e': return check_kwd(1, 3, "lse", TOKEN_ELSE);
  case 'i': return check_kwd(1, 1, "f", TOKEN_IF);
  case 'n': return check_kwd(1, 2, "il", TOKEN_NIL);
  case 'o': return check_kwd(1, 1, "r", TOKEN_OR);
  case 'p': return check_kwd(1, 4, "rint", TOKEN_PRINT);
  case 'r': return check_kwd(1, 5, "eturn", TOKEN_RET);
  case 's': return check_kwd(1, 4, "uper", TOKEN_SUPER);
  case 'v': return check_kwd(1, 2, "ar", TOKEN_VAR);
  case 'w': return check_kwd(1, 4, "hile", TOKEN_WHILE);

  case 'f':
    if (scanner.current - scanner.start > 1) {
      switch (*(scanner.start + 1)) {
      case 'a': return check_kwd(2, 3, "lse", TOKEN_FALSE);
      case 'u': return check_kwd(2, 1, "n", TOKEN_FUN);
      case 'o': return check_kwd(2, 1, "r", TOKEN_FOR);
      }
    }
    break;

  case 't':
    if (scanner.current - scanner.start > 1) {
      switch (*(scanner.start + 1)) {
      case 'h': return check_kwd(2, 2, "is", TOKEN_THIS);
      case 'r': return check_kwd(2, 2, "ue", TOKEN_TRUE);
      }
    }
    break;
  }

  return TOKEN_IDENT;
}

void scanner_init(char *src)
{
  scanner.start = src;
  scanner.current = src;
  scanner.line = 1;
}

struct token scanner_scan()
{
  skip_whitespace();
  scanner.start = scanner.current;

  if (!has_src()) return make_token(TOKEN_EOF);

  char c = advance();

  if (is_alpha(c)) {
    while (is_alphanum(peek())) advance();
    return make_token(kwd_or_ident());
  }

  if (is_digit(c)) {
    while (is_digit(peek())) advance();
    if (peek() == '.' && is_digit(peek2())) {
      // consume '.'
      advance();
      while (is_digit(peek())) advance();
    }
    return make_token(TOKEN_NUM);
  }

  switch(c) {
  case '(': return make_token(TOKEN_LPAREN);
  case ')': return make_token(TOKEN_RPAREN);
  case '{': return make_token(TOKEN_LBRACE);
  case '}': return make_token(TOKEN_RBRACE);
  case ';': return make_token(TOKEN_SEMICOLON);
  case ',': return make_token(TOKEN_COMMA);
  case '.': return make_token(TOKEN_DOT);
  case '-': return make_token(TOKEN_MINUS);
  case '+': return make_token(TOKEN_PLUS);
  case '*': return make_token(TOKEN_STAR);

  case '/':
    if (peek2() == '/') {
      while (peek() != '\n' && has_src()) advance();
      break;
    } else {
      return make_token(TOKEN_SLASH);
    }

  case '!':
    if (next('=')) {
      advance();
      return make_token(TOKEN_BANG_EQ);
    } else {
      return make_token(TOKEN_BANG);
    }

  case '=':
    if (next('=')) {
      advance();
      return make_token(TOKEN_EQ_EQ);
    } else {
      return make_token(TOKEN_EQ);
    }

  case '<':
    if (next('=')) {
      advance();
      return make_token(TOKEN_LESS_EQ);
    } else {
      return make_token(TOKEN_LESS);
    }

  case '>':
    if (next('=')) {
      advance();
      return make_token(TOKEN_GREATER_EQ);
    } else {
      return make_token(TOKEN_GREATER);
    }

  case '"':
    while (peek() != '"' && has_src()) {
      if (peek() == '\n') scanner.line++;
      advance();
    }

    if (!has_src()) return make_err_token("Unterminated string literal.");

    // consume closing '"'
    advance();
    return make_token(TOKEN_STR);
  }

  return make_err_token("Unexpected character.");
}
