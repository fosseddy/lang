#include <stddef.h>
#include <stdint.h>

#include "chunk.h"
#include "value.h"
#include "memory.h"

void chunk_init(struct chunk *c)
{
  c->size = 0;
  c->cap = 0;
  c->code = NULL;
  c->lines = NULL;
  value_array_init(&c->consts);
}

void chunk_put(struct chunk *c, uint8_t byte, size_t line)
{
  if (c->size + 1 > c->cap) {
    size_t old_cap = c->cap;
    c->cap = GROW_CAPACITY(old_cap);
    c->code = GROW_ARRAY(uint8_t, c->code, old_cap, c->cap);
    c->lines = GROW_ARRAY(size_t, c->lines, old_cap, c->cap);
  }

  c->code[c->size] = byte;
  c->lines[c->size] = line;

  c->size++;
}

void chunk_free(struct chunk *c)
{
  FREE_ARRAY(uint8_t, c->code, c->cap);
  FREE_ARRAY(size_t, c->lines, c->cap);
  value_array_free(&c->consts);
  chunk_init(c);
}

size_t chunk_add_const(struct chunk *c, double value)
{
  value_array_put(&c->consts, value);
  return c->consts.size - 1;
}
