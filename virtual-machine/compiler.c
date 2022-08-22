#include <stddef.h>
#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>

#include "compiler.h"
#include "chunk.h"
#include "scanner.h"

enum precedence {
  PREC_NONE = 0,
  PREC_ASSIGN,
  PREC_OR,
  PREC_AND,
  PREC_EQ,
  PREC_COMP,
  PREC_TERM,
  PREC_FACTOR,
  PREC_UNARY,
  PREC_CALL,
  PREC_PRIMARY
};

struct parser {
  struct token curr;
  struct token prev;
  bool had_err;
  bool panic;
};

static struct parser parser = {0};
static struct chunk *curr_chunk = {0};

static void report_err(struct token *t, char *msg)
{
  if (parser.panic) return;

  parser.panic = true;
  fprintf(stderr, "[line %lu] Error", t->line);

  if (t->kind == TOKEN_EOF) {
    fprintf(stderr, " at end");
  } else if (t->kind == TOKEN_ERR) {
  } else {
    fprintf(stderr, " at '%.*s'", (int) t->len, t->start);
  }

  fprintf(stderr, ": %s\n", msg);
  parser.had_err = true;
}

static void advance()
{
  parser.prev = parser.curr;
  for (;;) {
    parser.curr = scanner_scan();
    if (parser.curr.kind != TOKEN_ERR) break;

    report_err(&parser.curr, parser.curr.start);
  }
}

static void consume(enum token_kind kind, char *err_msg)
{
  if (parser.curr.kind == kind) {
    advance();
    return;
  }

  report_err(&parser.curr, err_msg);
}

static struct chunk *chunk()
{
  return curr_chunk;
}

static void emit_byte(uint8_t b) {
  chunk_put(chunk(), b, parser.prev.line);
}

static void emit_byte2(uint8_t b1, uint8_t b2) {
  emit_byte(b1);
  emit_byte(b2);
}

static uint8_t make_const(double val)
{
  size_t idx = chunk_put_const(chunk(), val);
  if (idx > UINT8_MAX) {
    report_err(&parser.curr, "Too many constants in one chunk.");
    return 0;
  }

  return (uint8_t) idx;
}

static void emit_const(double val)
{
  emit_byte2(OP_CONST, make_const(val));
}

static void parse_precedence(enum precedence prec)
{
  (void) prec;
}

static void number()
{
  double val = strtod(parser.prev.start, NULL);
  emit_const(val);
}

static void expression()
{
  parse_precedence(PREC_ASSIGN);
}

static void group()
{
  expression();
  consume(TOKEN_RPAREN, "Expect ')' after expression.");
}

static void unary()
{
  parse_precedence(PREC_UNARY);
  enum token_kind kind = parser.prev.kind;

  expression();

  switch (kind) {
  case TOKEN_MINUS: emit_byte(OP_NEG); break;
  default: assert(0);
  }
}

static void binary()
{
  enum token_kind kind = parser.prev.kind;
  struct parse_rule *rule = get_rule(kind);
  parse_precedence(rule->prec + 1);

  switch (kind) {
  case TOKEN_PLUS: emit_byte(OP_ADD); break;
  case TOKEN_MINUS: emit_byte(OP_SUB); break;
  case TOKEN_STAR: emit_byte(OP_MUL); break;
  case TOKEN_SLASH: emit_byte(OP_DIV); break;
  default: assert(0);
  }
}

bool compiler_compile(char *src, struct chunk *c)
{
  scanner_init(src);

  curr_chunk = c;
  parser.had_err = false;
  parser.panic = false;

  advance();
  expression();
  consume(TOKEN_EOF, "Expect end of expression.");

  emit_byte(OP_RET);
  return !parser.had_err;
}
