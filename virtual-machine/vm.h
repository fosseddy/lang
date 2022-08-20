#ifndef VM_H
#define VM_H

#include <stdint.h>

#include "chunk.h"

struct vm {
  struct chunk *chunk;
  uint8_t *ip;
};

enum exec_result {
  EXEC_OK = 0,
  EXEC_COMPILE_ERR,
  EXEC_RUNTIME_ERR
};

void vm_init(struct vm *vm);
void vm_free(struct vm *vm);
enum exec_result vm_execute(struct vm *vm, struct chunk *c);

#endif
