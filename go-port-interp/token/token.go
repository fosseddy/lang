package token

import "strconv"

type Kind int

const (
	LPAREN Kind = iota
	RPAREN
	LBRACE
	RBRACE
	COMMA
	DOT
	MINUS
	PLUS
	SEMICOLON
	SLASH
	STAR

	BANG
	BANG_EQ
	EQ
	EQ_EQ
	GREATER
	GREATER_EQ
	LESS
	LESS_EQ

	IDENT
	STR
	NUM

	AND
	CLASS
	ELSE
	FALSE
	FUN
	FOR
	IF
	NIL
	OR
	PRINT
	RETURN
	SUPER
	THIS
	TRUE
	VAR
	WHILE

	EOF
)

var keywords = map[string]Kind{
	"and":    AND,
	"class":  CLASS,
	"else":   ELSE,
	"false":  FALSE,
	"for":    FOR,
	"fun":    FUN,
	"if":     IF,
	"nil":    NIL,
	"or":     OR,
	"print":  PRINT,
	"return": RETURN,
	"super":  SUPER,
	"this":   THIS,
	"true":   TRUE,
	"var":    VAR,
	"while":  WHILE,
}

func Lookup(ident string) Kind {
	if tok, isKwd := keywords[ident]; isKwd {
		return tok
	}

	return IDENT
}

func (t Token) String() string {
	switch t.Kind {
	case IDENT:
		return "IDENT(" + t.Lex + ")"
	case EOF:
		return "EOF"
	case STR:
		return "STR(" + t.Lit.(string) + ")"
	case NUM:
		return "NUM(" + strconv.Itoa(t.Lit.(int)) + ")"
	}

	return t.Lex
}

type Token struct {
	Kind Kind
	Lex  string
	Lit  any
	Line int
}
