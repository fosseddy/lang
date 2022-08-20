#include <stdio.h>

#include "chunk.h"
#include "debug.h"

int main(void)
{
  struct chunk c;
  chunk_init(&c);

  chunk_write(&c, OP_CONST);
  chunk_write(&c, chunk_add_const(&c, 69));

  chunk_write(&c, OP_CONST);
  chunk_write(&c, chunk_add_const(&c, 420));

  chunk_write(&c, OP_RET);

  disasm_chunk(&c, "test chunk");

  chunk_free(&c);
  return 0;
}
