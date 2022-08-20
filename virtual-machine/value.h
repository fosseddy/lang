#ifndef VALUE_H
#define VALUE_H

#include <stddef.h>

struct value_array {
  double *values;
  size_t size;
  size_t cap;
};

void value_array_init(struct value_array *a);
void value_array_put(struct value_array *a, double v);
void value_array_free(struct value_array *a);

void value_print(double v);

#endif
