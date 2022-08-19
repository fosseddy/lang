#ifndef value_h
#define value_h

#include <stddef.h>

typedef double word;

struct word_array {
  word *values;
  size_t size;
  size_t cap;
};

void word_array_init(struct word_array *a);
void word_array_write(struct word_array *a, word w);
void word_array_free(struct word_array *a);
void print_word(word value);

#endif
