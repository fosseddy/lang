#ifndef chunk_h
#define chunk_h

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
};

void chunk_init(struct chunk *c);
void chunk_write(struct chunk *c, uint8_t b);
void chunk_free(struct chunk *c);
size_t chunk_add_const(struct chunk *c, double value);

#endif
