#include <stddef.h>

#include "chunk.h"
#include "value.h"
#include "memory.h"

void chunk_init(struct chunk *c)
{
  c->size = 0;
  c->cap = 0;
  c->code = NULL;
  word_array_init(&c->constants);
}

void chunk_write(struct chunk *c, byte b)
{
  if (c->size + 1 > c->cap) {
    size_t old_cap = c->cap;
    c->cap = GROW_CAPACITY(old_cap);
    c->code = GROW_ARRAY(byte, c->code, old_cap, c->cap);
  }

  c->code[c->size++] = b;
}

void chunk_free(struct chunk *c)
{
  FREE_ARRAY(byte, c->code, c->cap);
  word_array_free(&c->constants);
  chunk_init(c);
}

size_t chunk_add_constant(struct chunk *c, word value)
{
  word_array_write(&c->constants, value);
  return c->constants.size - 1;
}
