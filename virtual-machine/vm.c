#include <assert.h>
#include <stdint.h>
#include <stdio.h>

#include "vm.h"
#include "chunk.h"
#include "value.h"
#include "compiler.h"
#include "debug.h"

static void stack_push(struct vm *vm, double v)
{
  *vm->sp = v;
  vm->sp++;
}

static double stack_pop(struct vm *vm)
{
  vm->sp--;
  return *vm->sp;
}

void vm_init(struct vm *vm)
{
  vm->sp = vm->stack;
}

void vm_free(struct vm *vm)
{
  (void) vm;
}

enum exec_result vm_interpret(struct vm *vm, char *src)
{
  struct chunk c;
  chunk_init(&c);

  if (!compiler_compile(src, &c)) {
    chunk_free(&c);
    return EXEC_COMPILE_ERR;
  }

  vm->chunk = &c;
  vm->ip = vm->chunk->code;

  enum exec_result res = vm_execute(vm);

  chunk_free(&c);
  return res;
}

enum exec_result vm_execute(struct vm *vm)
{
  for (;;) {
    // @NOTE(art): DEBUG
    printf("          ");
    for (double *slot = vm->stack; slot < vm->sp; slot++) {
      printf("[ ");
      value_print(*slot);
      printf(" ]");
    }
    printf("\n");
    disasm_inst(vm->chunk, (size_t) (vm->ip - vm->chunk->code));
    // @NOTE(art): END_DEBUG

    uint8_t inst = *vm->ip++;

    switch(inst) {
    case OP_CONST: {
      double val = vm->chunk->consts.values[*vm->ip++];
      stack_push(vm, val);
    } break;

    case OP_ADD: {
      double b = stack_pop(vm);
      double a = stack_pop(vm);
      stack_push(vm, a + b);
    } break;

    case OP_SUB: {
      double b = stack_pop(vm);
      double a = stack_pop(vm);
      stack_push(vm, a - b);
    } break;

    case OP_MUL: {
      double b = stack_pop(vm);
      double a = stack_pop(vm);
      stack_push(vm, a * b);
    } break;

    case OP_DIV: {
      double b = stack_pop(vm);
      double a = stack_pop(vm);
      stack_push(vm, a / b);
    } break;

    case OP_NEG: {
      stack_push(vm, -stack_pop(vm));
    } break;

    case OP_RET: {
      return EXEC_OK;
    }

    default: assert(0);
    }
  }
}
