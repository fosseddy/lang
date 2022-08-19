#include <stdio.h>

#include "value.h"
#include "memory.h"

void word_array_init(struct word_array *a)
{
  a->size = 0;
  a->cap = 0;
  a->values = NULL;
}

void word_array_write(struct word_array *a, word w)
{
  if (a->size + 1 > a->cap) {
    size_t old_cap = a->cap;
    a->cap = GROW_CAPACITY(old_cap);
    a->values = GROW_ARRAY(word, a->values, old_cap, a->cap);
  }

  a->values[a->size++] = w;
}

void word_array_free(struct word_array *a)
{
  FREE_ARRAY(word, a->values, a->cap);
  word_array_init(a);
}

void print_word(word value)
{
  printf("%g", value);
}
