#ifndef MEMORY_H
#define MEMORY_H

#include <stddef.h>

#define GROW_CAPACITY(old) (old) < 8 ? 8 : (old) * 2

#define GROW_ARRAY(type, ptr, old_cap, new_cap) \
  (type *) reallocate(ptr, sizeof(type) * (old_cap), sizeof(type) * (new_cap))

#define FREE_ARRAY(type, ptr, old_cap) \
  reallocate(ptr, sizeof(type) * (old_cap), 0)

void *reallocate(void *p, size_t old_cap, size_t new_cap);

#endif
