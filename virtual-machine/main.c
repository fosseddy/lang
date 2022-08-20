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
  chunk_put(&c, chunk_put_const(&c, 1.2), 1);
  chunk_put(&c, OP_RET, 2);

  vm_execute(&vm, &c);

  chunk_free(&c);
  vm_free(&vm);

  return 0;
}
