package main

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDoSavePage(t *testing.T) {

	err := doSavePage(context.Background(), "../third-party/single-file-cli", ".", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		"https://google.com", randID(10)+".html")
	assert.Nil(t, err)
}

func TestGetPageTitle(t *testing.T) {
	filename := randID(10) + ".html"
	err := doSavePage(context.Background(), "../third-party/single-file-cli", ".", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		"https://google.com", filename)
	assert.Nil(t, err)
	defer safeRemove(filename)
	title, err := getPageTitle(filename)
	assert.Nil(t, err)
	assert.Equal(t, "Google", title)
}

func TestGetPageTitle2(t *testing.T) {
	filename := randID(10) + ".html"
	err := doSavePage(context.Background(), "../third-party/single-file-cli", ".", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		"https://google.com", filename)
	assert.Nil(t, err)
	defer safeRemove(filename)
	title, err := getPageTitle2(filename)
	assert.Nil(t, err)
	assert.Equal(t, "Google", title)
}

func TestGetFavicon(t *testing.T) {
	// fmt.Println(getFavicon("/Users/hyan23/Desktop/offliner-data/4PxR4fMH/index.html"))
	// fmt.Println(getFavicon("/Users/hyan23/Desktop/offliner-data/bKbSxsQ_/index.html"))
}

func TestGetAndSaveFavicon(t *testing.T) {
	// fmt.Println(getAndSaveFavicon("/Users/hyan23/Desktop/offliner-data/4PxR4fMH/index.html", "favicon.ico"))
	// fmt.Println(getAndSaveFavicon("/Users/hyan23/Desktop/offliner-data/nYX7B95W/index.html", "favicon.ico"))
}
