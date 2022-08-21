// @TODO(art): create Makefile
// @TODO(art): implement run-length encoding for lines
// @TODO(art): add OP_CONST_LONG instruction

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

#include "vm.h"
#include "chunk.h"
#include "debug.h"

static char *read_src(char *path)
{
  FILE *f = fopen(path, "r");
  if (f == NULL) {
    fprintf(stderr, "%s\n", strerror(errno));
    exit(1);
  }

  fseek(f, 0, SEEK_END);
  size_t file_size = (size_t) ftell(f);
  rewind(f);

  char *buf = malloc(sizeof(char) * file_size + 1);
  if (buf == NULL) {
    fprintf(stderr, "%s\n", strerror(errno));
    exit(1);
  }

  size_t n = fread(buf, sizeof(char), file_size, f);
  if (file_size != n) {
    fprintf(stderr, "Could not read file.\n");
    exit(1);
  }

  buf[file_size] = '\0';
  fclose(f);

  return buf;
}

static void exec_file(struct vm *vm, char *path)
{
  char *src = read_src(path);
  enum exec_result res = vm_interpret(vm, src);
  free(src);

  if (res == EXEC_COMPILE_ERR) exit(1);
  if (res == EXEC_RUNTIME_ERR) exit(1);
}

int main(int argc, char **argv)
{
  static struct vm vm = {0};
  vm_init(&vm);

  if (argc == 2) {
    exec_file(&vm, argv[1]);
  } else {
    fprintf(stderr, "Usage: main [SCRIPT]\n");
    exit(1);
  }

  vm_free(&vm);
  return 0;
}
