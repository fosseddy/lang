#include <stddef.h>
#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>

#include "compiler.h"
#include "chunk.h"
#include "scanner.h"

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

static void expression()
{
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
