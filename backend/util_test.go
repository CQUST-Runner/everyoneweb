package main

import (
	"fmt"
	"os"
	"testing"
)

func TestRandID(t *testing.T) {
	fmt.Println(randID(8))
	fmt.Println(randID(8))
	fmt.Println(randID(8))
	fmt.Println(randID(8))
	fmt.Println(randID(8))
}

func TestDirSize(t *testing.T) {
	fmt.Println(dirSize("."))
}

func TestCopyDir(t *testing.T) {
	fmt.Sprintln(copyDir(".", "../copy_dir_test"))
	os.RemoveAll("../copy_dir_test")
}

func TestGetDefaultDataDirectory(t *testing.T) {
	fmt.Println(getDefaultDataDirectory())
}
