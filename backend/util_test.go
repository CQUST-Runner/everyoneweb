package main

import (
	"fmt"
	"testing"
)

func TestRandID(t *testing.T) {
	fmt.Println(randID(8))
	fmt.Println(randID(8))
	fmt.Println(randID(8))
	fmt.Println(randID(8))
	fmt.Println(randID(8))
}
