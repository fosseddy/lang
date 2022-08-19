#ifndef chunk_h
#define chunk_h

#include <stdint.h>
#include <stddef.h>

#include "value.h"

typedef uint8_t byte;

enum op_code {
  OP_CONST,
  OP_RET
};

struct chunk {
  byte *code;
  size_t size;
  size_t cap;

  struct word_array constants;
};

void chunk_init(struct chunk *c);
void chunk_write(struct chunk *c, byte b);
void chunk_free(struct chunk *c);
size_t chunk_add_constant(struct chunk *c, word value);

#endif
