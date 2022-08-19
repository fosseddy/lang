#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>

#include "memory.h"

void *reallocate(void *ptr, size_t old_cap, size_t new_cap)
{
  if (new_cap == 0) {
    free(ptr);
    return NULL;
  }

  void *result = realloc(ptr, new_cap);
  if (result == NULL) {
    fprintf(stderr, "%s\n", strerror(errno));
    exit(1);
  }

  return result;
}
