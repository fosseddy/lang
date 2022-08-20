#include <assert.h>
#include <stdint.h>
#include <stdio.h>

#include "vm.h"
#include "chunk.h"
#include "value.h"
#include "debug.h"

void vm_init(struct vm *vm)
{
}

void vm_free(struct vm *vm)
{
}

enum exec_result vm_execute(struct vm *vm, struct chunk *c)
{
  vm->chunk = c;
  vm->ip = vm->chunk->code;

  for (;;) {
    disasm_inst(vm->chunk, (size_t) (vm->ip - vm->chunk->code));
    uint8_t inst = *vm->ip++;

    switch(inst) {
    case OP_RET: {
      return EXEC_OK;
    }

    case OP_CONST: {
      double val = vm->chunk->consts.values[*vm->ip++];
      value_print(val);
      printf("\n");
    } break;

    default: assert(0);
    }
  }
}
