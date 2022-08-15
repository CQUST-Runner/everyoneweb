package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path"

	"github.com/CQUST-Runner/datacross/storage"
)

// dependencies: Chrome，nodejs
// --back-end=jsdom
// or --browser-executable-path=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
// ./single-file --browser-executable-path=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome https://www.github.com
func doSavePage(ctx context.Context, singleFileCli string, dataDirectory string, chromePath string, url string, id string) (string, error) {
	htmlFile := fmt.Sprintf("%v.html", id)
	if storage.IsFile(htmlFile) {
		return "", fmt.Errorf("file exists")
	}

	singleFile := path.Join(singleFileCli, "single-file")
	singleFile, err := storage.ToAbs(singleFile)
	if err != nil {
		return "", err
	}

	// TODO: support windows batch files
	cmd := exec.CommandContext(ctx, singleFile, url, htmlFile, "--browser-executable-path="+chromePath)
	cmd.Dir = dataDirectory
	cmd.Stdin = nil
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		return "", err
	}
	fmt.Println("run cmd:")
	fmt.Println(cmd.String())

	if !storage.IsFile(htmlFile) {
		return "", fmt.Errorf("page not saved properly")
	}
	return htmlFile, nil
}
