package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"my-lang/scanner"
)

var (
	hadError = true
	hadRuntimeError = false
)

func execFile(path string) {
	src, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	exec(string(src))

	if hadError || hadRuntimeError {
		os.Exit(1)
	}
}

func execPromt() {
	s := bufio.NewScanner(os.Stdin)

	fmt.Print("> ")
	for s.Scan() {
		exec(s.Text())
		hadError = false
		fmt.Print("> ")
	}
}

func exec(src string) {
	s := scanner.NewScanner(src)
	ts := s.Scan()
	for _, t := range ts {
		fmt.Println(t)
	}
	//const s = new Scanner(source);
	//const p = new Parser(s.scan());

	//interpreter.interpret(p.parse());
}

func main() {
	args := os.Args[1:]

	switch {
	case len(args) > 1:
		log.Fatal("Usage: my-lang [SCRIPT]")

	case len(args) == 1:
		execFile(args[0])

	default:
		execPromt()
	}
}
