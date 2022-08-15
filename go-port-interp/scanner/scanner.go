package scanner

import (
	"fmt"
	"my-lang/token"
	"strconv"
)

type Scanner struct {
	tokens  []token.Token
	src     string
	start   int
	current int
	line    int
}

func NewScanner(src string) *Scanner {
	return &Scanner{
		tokens:  []token.Token{},
		src:     src,
		start:   0,
		current: 0,
		line:    1,
	}
}

func (s *Scanner) Scan() []token.Token {
	for s.hasSource() {
		s.start = s.current

		c := s.advance()

		switch c {
		case ' ':
		case '\t':
		case '\r':
			break

		case '\n':
			s.line++

		case '(':
			s.add(token.LPAREN)
		case ')':
			s.add(token.RPAREN)
		case '{':
			s.add(token.LBRACE)
		case '}':
			s.add(token.RBRACE)
		case ',':
			s.add(token.COMMA)
		case '.':
			s.add(token.DOT)
		case '-':
			s.add(token.MINUS)
		case '+':
			s.add(token.PLUS)
		case ';':
			s.add(token.SEMICOLON)
		case '*':
			s.add(token.STAR)

		case '!':
			if s.next('=') {
				s.advance()
				s.add(token.BANG_EQ)
			} else {
				s.add(token.BANG)
			}
		case '=':
			if s.next('=') {
				s.advance()
				s.add(token.EQ_EQ)
			} else {
				s.add(token.EQ)
			}
		case '<':
			if s.next('=') {
				s.advance()
				s.add(token.LESS_EQ)
			} else {
				s.add(token.LESS)
			}
		case '>':
			if s.next('=') {
				s.advance()
				s.add(token.GREATER_EQ)
			} else {
				s.add(token.GREATER)
			}

		case '/':
			if s.next('/') {
				for !s.next('\n') && s.hasSource() {
					s.advance()
				}
			} else {
				s.add(token.SLASH)
			}

		case '"':
			for !s.next('"') && s.hasSource() {
				if s.next('\n') {
					s.line++
				}
				s.advance()
			}

			if !s.hasSource() {
				fmt.Printf("[line %v] Unterminated string literal", s.line)
				break
			}

			// consume closing "
			s.advance()

			lit := s.src[s.start+1 : s.current-1]
			s.addWithLit(token.STR, lit)

		default:
			if isDigit(c) {
				for isDigit(s.peek()) {
					s.advance()
				}

				if s.next('.') && isDigit(s.peek2()) {
					//consume .
					s.advance()
					for isDigit(s.peek()) {
						s.advance()
					}
				}

				lit, err := strconv.Atoi(s.src[s.start:s.current])
				if err != nil {
					panic("scanner could not correctly scan the number")
				}
				s.addWithLit(token.NUM, lit)
			} else if isAlpha(c) {
				for isAlphaNum(s.peek()) {
					s.advance()
				}

				kind := token.Lookup(s.src[s.start:s.current])
				s.add(kind)
			} else {
				fmt.Printf("Unexpected character: %v\n", c)
			}
		}
	}

	return s.tokens
}

func (s *Scanner) hasSource() bool {
	return s.current < len(s.src)
}

func (s *Scanner) advance() byte {
	c := s.src[s.current]
	s.current++

	return c
}

func (s *Scanner) next(c byte) bool {
	if !s.hasSource() {
		return false
	}

	return s.peek() == c
}

func (s *Scanner) peek() byte {
	if !s.hasSource() {
		return '\x00'
	}

	return s.src[s.current]
}

func (s *Scanner) peek2() byte {
	if s.current+1 > len(s.src) {
		return '\x00'
	}

	return s.src[s.current+1]
}

func (s *Scanner) add(kind token.Kind) {
	s.tokens = append(
		s.tokens,
		token.Token{kind, s.src[s.start:s.current], nil, s.line},
	)
}

func (s *Scanner) addWithLit(kind token.Kind, lit any) {
	s.tokens = append(
		s.tokens,
		token.Token{kind, s.src[s.start:s.current], lit, s.line},
	)
}

func isDigit(c byte) bool {
	return c >= '0' && c <= '9'
}

func isAlpha(c byte) bool {
	return (c >= 'a' && c <= 'z') ||
		(c >= 'A' && c <= 'Z') ||
		c == '_'
}

func isAlphaNum(c byte) bool {
	return isAlpha(c) || isDigit(c)
}
