#ifndef VM_H
#define VM_H

#include "chunk.h"

struct vm {
  struct chunk *chunk;
};

void vm_init(struct vm *vm);
void vm_free(struct vm *vm);

#endif
