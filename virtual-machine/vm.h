#ifndef VM_H
#define VM_H

#include <stdint.h>

#include "chunk.h"

#define STACK_CAP 256

struct vm {
  struct chunk *chunk;
  uint8_t *ip;

  double stack[STACK_CAP];
  double *sp;
};

enum exec_result {
  EXEC_OK = 0,
  EXEC_COMPILE_ERR,
  EXEC_RUNTIME_ERR
};

void vm_init(struct vm *vm);
void vm_free(struct vm *vm);
enum exec_result vm_execute(struct vm *vm, struct chunk *c);
enum exec_result vm_interpret(struct vm *vm, char *src);

#endif
