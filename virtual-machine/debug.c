#include <stddef.h>
#include <stdint.h>
#include <stdio.h>

#include "chunk.h"
#include "debug.h"

static size_t simple_inst(char *name, size_t offset)
{
  printf("%s\n", name);
  return offset + 1;
}

static size_t const_inst(char *name, struct chunk *c, size_t offset)
{
  uint8_t val_idx = c->code[offset + 1];

  printf("%-16s %4d '", name, val_idx);
  value_print(c->consts.values[val_idx]);
  printf("'\n");

  return offset + 2;
}

void disasm_chunk(struct chunk *c, char *name)
{
  printf("== %s ==\n", name);
  for (size_t i = 0; i < c->size;) {
    i = disasm_inst(c, i);
  }
}

size_t disasm_inst(struct chunk *c, size_t offset)
{
  printf("%04d ", offset);
  uint8_t inst = c->code[offset];

  if (offset > 0 && c->lines[offset] == c->lines[offset - 1]) {
    printf("   | ");
  } else {
    printf("%4d ", c->lines[offset]);
  }

  switch (inst) {
  case OP_RET:
    return simple_inst("OP_RET", offset);
  case OP_CONST:
    return const_inst("OP_CONST", c, offset);

  default:
    printf("Unknown opcode %d\n", inst);
    return offset + 1;
  }
}
