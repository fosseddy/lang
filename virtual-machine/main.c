#include <stdio.h>

#include "chunk.h"
#include "debug.h"

int main(void)
{
  struct chunk c;
  chunk_init(&c);

  chunk_put(&c, OP_CONST, 1);
  chunk_put(&c, chunk_add_const(&c, 69), 1);

  chunk_put(&c, OP_CONST, 1);
  chunk_put(&c, chunk_add_const(&c, 420), 1);

  chunk_put(&c, OP_RET, 2);

  disasm_chunk(&c, "test chunk");

  chunk_free(&c);
  return 0;
}
