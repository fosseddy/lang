#ifndef CHUNK_H
#define CHUNK_H

#include <stdint.h>
#include <stddef.h>

#include "value.h"

enum op_code {
  OP_CONST,
  OP_RET
};

struct chunk {
  uint8_t *code;
  size_t size;
  size_t cap;

  struct value_array consts;

  size_t *lines;
};

void chunk_init(struct chunk *c);
void chunk_put(struct chunk *c, uint8_t byte, size_t line);
void chunk_free(struct chunk *c);
size_t chunk_put_const(struct chunk *c, double value);

#endif
