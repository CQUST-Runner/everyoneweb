package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path"
	"regexp"
	"strings"

	"github.com/CQUST-Runner/datacross/storage"
)

func getPageFileNameById(id string) string {
	return fmt.Sprintf("%v.html", id)
}

// dependencies: Chrome，nodejs
// --back-end=jsdom
// or --browser-executable-path=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
// ./single-file --browser-executable-path=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome https://www.github.com
func doSavePage(ctx context.Context, singleFileCli string, dataDirectory string, chromePath string, url string, id string) (string, error) {
	htmlFile := getPageFileNameById(id)
	htmlFile = path.Join(dataDirectory, htmlFile)
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
	cmd.Stdin = nil
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		return "", err
	}
	logger.Info("run cmd:")
	logger.Info(cmd.String())

	if !storage.IsFile(htmlFile) {
		return "", fmt.Errorf("page not saved properly")
	}
	return htmlFile, nil
}

func getPageTitle2(filename string) (string, error) {
	openingTag := regexp.MustCompile("<title>")
	closingTag := regexp.MustCompile("</title>")
	bytes, err := ioutil.ReadFile(filename)
	if err != nil {
		return "", err
	}
	loc1 := openingTag.FindIndex(bytes)
	if len(loc1) < 2 {
		return "", fmt.Errorf("cannot find opening tag")
	}
	loc2 := closingTag.FindIndex(bytes[loc1[1]:])
	if len(loc2) < 2 {
		return "", fmt.Errorf("cannot find closing tag")
	}
	title := string(bytes[loc1[1] : loc1[1]+loc2[0]])
	title = strings.TrimSpace(title)
	return title, nil
}

func getPageTitle(filename string) (string, error) {
	r := regexp.MustCompile("<title>(.*?)</title>")
	bytes, err := ioutil.ReadFile(filename)
	if err != nil {
		return "", err
	}
	matches := r.FindStringSubmatch(string(bytes))
	if matches == nil || len(matches) < 2 {
		return "", fmt.Errorf("cannot find title")
	}
	title := matches[1]
	title = strings.TrimSpace(title)
	return title, nil
}

func getPageDescription(filename string) string {
	//this is not meant to be a very comprehensive method
	r := regexp.MustCompile(`<meta name="description" content="(.*?)">`)
	bytes, err := ioutil.ReadFile(filename)
	if err != nil {
		return ""
	}
	matches := r.FindStringSubmatch(string(bytes))
	if matches == nil || len(matches) < 2 {
		return ""
	}
	description := matches[1]
	description = strings.TrimSpace(description)
	return description
}
