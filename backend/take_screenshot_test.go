package main

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTakeScreenShot(t *testing.T) {
	err := takeScreenShot("https://google.com", "test.png")
	assert.Nil(t, err)
	os.Remove("test.png")
}
