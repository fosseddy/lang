#include <stddef.h>
#include <stdio.h>

#include "compiler.h"
#include "scanner.h"

void compile(char *src)
{
  scanner_init(src);
  size_t line = -1;

  for (;;) {
    struct token t = scanner_scan();
    if (t.line != line) {
      printf("%4ld ", t.line);
      line = t.line;
    } else {
      printf("    | ");
    }

    printf("%2d '%.*s'\n", t.kind, (int) t.len, t.start);

    if (t.kind == TOKEN_EOF) break;
  }
}
