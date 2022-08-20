// @TODO(art): create Makefile
// @TODO(art): implement run-length encoding for lines
// @TODO(art): add OP_CONST_LONG instruction

#include <stdio.h>

#include "vm.h"
#include "chunk.h"
#include "debug.h"

int main(void)
{
  static struct vm vm = {0};
  vm_init(&vm);

  struct chunk c;
  chunk_init(&c);

  chunk_put(&c, OP_CONST, 1);
  chunk_put(&c, chunk_put_const(&c, 2), 1);
  chunk_put(&c, OP_CONST, 1);
  chunk_put(&c, chunk_put_const(&c, 4), 1);
  chunk_put(&c, OP_ADD, 1);

  chunk_put(&c, OP_CONST, 2);
  chunk_put(&c, chunk_put_const(&c, 1), 2);
  chunk_put(&c, OP_SUB, 2);

  chunk_put(&c, OP_CONST, 3);
  chunk_put(&c, chunk_put_const(&c, 3), 3);
  chunk_put(&c, OP_MUL, 3);

  chunk_put(&c, OP_CONST, 4);
  chunk_put(&c, chunk_put_const(&c, 1), 4);
  chunk_put(&c, OP_SUB, 4);

  chunk_put(&c, OP_CONST, 5);
  chunk_put(&c, chunk_put_const(&c, 7), 5);
  chunk_put(&c, OP_DIV, 5);
  chunk_put(&c, OP_NEG, 5);

  chunk_put(&c, OP_RET, 6);

  vm_execute(&vm, &c);

  chunk_free(&c);
  vm_free(&vm);

  return 0;
}
