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
	"github.com/vincent-petithory/dataurl"
)

func getPageFileNameById(id string) string {
	// return fmt.Sprintf("%v.html", id)
	return "index.html"
}

// dependencies: Chrome，nodejs
// --back-end=jsdom
// or --browser-executable-path=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
// ./single-file --browser-executable-path=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome https://www.github.com
func doSavePage(ctx context.Context, singleFileCli string, dataDirectory string, chromePath string, url string, filename string) error {
	htmlFile := filename

	singleFile := path.Join(singleFileCli, "single-file")
	singleFile, err := storage.ToAbs(singleFile)
	if err != nil {
		return err
	}

	// TODO: support windows batch files
	cmd := exec.CommandContext(ctx, "node", singleFile, url, htmlFile, "--browser-executable-path="+chromePath)
	cmd.Stdin = nil
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	logger.Info("run cmd:")
	logger.Info(cmd.String())
	err = cmd.Run()
	if err != nil {
		return err
	}

	if !storage.IsFile(htmlFile) {
		return fmt.Errorf("page not saved properly")
	}
	return nil
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

func getAndSaveFavicon(filename string, output string) (string, error) {
	dataUri := getFavicon(filename)
	if dataUri == "" {
		return "", fmt.Errorf("get favicon failed")
	}

	// fmt.Println(dataUri)
	l, err := dataurl.DecodeString(dataUri)
	if err != nil {
		return "", err
	}
	err = ioutil.WriteFile(output, l.Data, 0o644)
	if err != nil {
		return "", err
	}
	return l.ContentType(), nil
}

func getFavicon(filename string) string {
	//the required syntax is more strict than standard HTML
	r := regexp.MustCompile(`(<link.*?rel="icon".*?>|<link.*?rel="shortcut icon".*?>)`)
	bytes, err := ioutil.ReadFile(filename)
	if err != nil {
		logger.Error("open %v failed", filename)
		return ""
	}
	matches := r.FindStringSubmatch(string(bytes))
	if matches == nil || len(matches) < 2 {
		return ""
	}
	tag := matches[1]
	tag = strings.TrimSpace(tag)

	r2 := regexp.MustCompile(`href="(.*?)"`)
	matches = r2.FindStringSubmatch(tag)
	if matches == nil || len(matches) < 2 {
		return ""
	}

	data := matches[1]
	data = strings.TrimSpace(data)
	return data
}
