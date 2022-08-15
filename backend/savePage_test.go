package main

import (
	"context"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDoSavePage(t *testing.T) {
	_, err := doSavePage(context.Background(), "../third-party/single-file-cli", ".", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		"https://google.com", randID(10))
	assert.Nil(t, err)
}

func TestGetPageTitle(t *testing.T) {
	filename, err := doSavePage(context.Background(), "../third-party/single-file-cli", ".", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		"https://google.com", randID(10))
	assert.Nil(t, err)
	defer os.Remove(filename)
	title, err := getPageTitle(filename)
	assert.Nil(t, err)
	assert.Equal(t, "Google", title)
}
