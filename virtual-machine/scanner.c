#include <stdio.h>

#include "scanner.h"

struct scanner {
  char *start;
  char *current;
  size_t line;
};

static struct scanner scanner = {0};

void scanner_init(char *src)
{
  scanner.start = src;
  scanner.current = src;
  scanner.line = 1;
}
