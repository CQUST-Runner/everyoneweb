package storage

import (
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMmap(t *testing.T) {
	// dir := t.TempDir()
	// filename := path.Join(dir, "test")
	defer os.Remove("test.txt")
	filename := "test.txt"

	f := MmapFile{}
	err := f.Init(filename)
	assert.Nil(t, err)
	defer f.Close()

	s := f.AsSlice()
	fmt.Println(string(s))
	for i := range s {
		s[i] = 't'
	}
	f.Flush()
}
