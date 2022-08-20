#include <stdio.h>

#include "value.h"
#include "memory.h"

void value_array_init(struct value_array *a)
{
  a->size = 0;
  a->cap = 0;
  a->values = NULL;
}

void value_array_write(struct value_array *a, double w)
{
  if (a->size + 1 > a->cap) {
    size_t old_cap = a->cap;
    a->cap = GROW_CAPACITY(old_cap);
    a->values = GROW_ARRAY(double, a->values, old_cap, a->cap);
  }

  a->values[a->size++] = w;
}

void value_array_free(struct value_array *a)
{
  FREE_ARRAY(double, a->values, a->cap);
  value_array_init(a);
}

void value_print(double v)
{
  printf("%g", v);
}
