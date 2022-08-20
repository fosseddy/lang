#ifndef DEBUG_H
#define DEBUG_H

#include <stddef.h>

#include "chunk.h"

void disasm_chunk(struct chunk *c, char *name);
size_t disasm_inst(struct chunk *c, size_t offset);

#endif
