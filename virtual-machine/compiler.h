#ifndef COMPILER_H
#define COMPILER_H

#include <stdbool.h>

#include "chunk.h"

bool compiler_compile(char *src, struct chunk *c);

#endif
