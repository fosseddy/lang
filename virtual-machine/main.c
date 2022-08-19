#include <stdio.h>

#include "chunk.h"
#include "debug.h"

int main(void)
{
  struct chunk c;
  chunk_init(&c);
  chunk_write(&c, OP_RET);
  disasm_chunk(&c, "main");
  chunk_free(&c);
  return 0;
}
