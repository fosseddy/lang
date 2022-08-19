#include <stddef.h>
#include <stdio.h>

#include "chunk.h"
#include "debug.h"

static size_t simple_instruction(const char *name, size_t offset)
{
  printf("%s\n", name);
  return offset + 1;
}

void disasm_chunk(struct chunk *c, char *name)
{
  printf("== %s ==\n", name);
  for (size_t i = 0; i < c->size;) {
    i = disasm_instruction(c, i);
  }
}

size_t disasm_instruction(struct chunk *c, size_t offset)
{
  printf("%04d ", offset);
  byte inst = c->code[offset];

  switch (inst) {
  case OP_RET:
    return simple_instruction("OP_RET", offset);

  default:
    printf("Unknown opcode %d\n", inst);
    return offset + 1;
  }
}
