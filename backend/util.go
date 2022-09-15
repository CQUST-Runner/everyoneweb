package main

import (
	"crypto/rand"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/CQUST-Runner/datacross/storage"
	"github.com/denisbrodbeck/machineid"
)

// https://github.com/chromedp/chromedp/blob/fb22a3c9e832e0d18aa3838298552563576a46c9/allocate.go#L344
// findExecPath tries to find the Chrome browser somewhere in the current
// system. It finds in different locations on different OS systems.
// It could perform a rather aggressive search. That may make it a bit slow,
// but it will only be run when creating a new ExecAllocator.
func findExecPath() string {
	var locations []string
	switch runtime.GOOS {
	case "darwin":
		locations = []string{
			// Mac
			"/Applications/Chromium.app/Contents/MacOS/Chromium",
			"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		}
	case "windows":
		locations = []string{
			// Windows
			"chrome",
			"chrome.exe", // in case PATHEXT is misconfigured
			`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`,
			`C:\Program Files\Google\Chrome\Application\chrome.exe`,
			filepath.Join(os.Getenv("USERPROFILE"), `AppData\Local\Google\Chrome\Application\chrome.exe`),
			filepath.Join(os.Getenv("USERPROFILE"), `AppData\Local\Chromium\Application\chrome.exe`),
		}
	default:
		locations = []string{
			// Unix-like
			"headless_shell",
			"headless-shell",
			"chromium",
			"chromium-browser",
			"google-chrome",
			"google-chrome-stable",
			"google-chrome-beta",
			"google-chrome-unstable",
			"/usr/bin/google-chrome",
			"/usr/local/bin/chrome",
			"/snap/bin/chromium",
			"chrome",
		}
	}

	for _, path := range locations {
		found, err := exec.LookPath(path)
		if err == nil {
			return found
		}
	}
	// Fall back to something simple and sensible, to give a useful error
	// message.
	return "google-chrome"
}

func randID(length int) string {
	var dict = [256]byte{
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
		'_', '_', '_', '_', '_', '_', '_', '_',
	}
	id := make([]byte, length)
	_, _ = rand.Read(id[:])
	for i := range id {
		id[i] = dict[id[i]]
	}
	return string(id[:])
}

func withCORS(f func(w http.ResponseWriter, req *http.Request)) func(w http.ResponseWriter, req *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if req.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
			w.WriteHeader(http.StatusOK)
			return
		}
		f(w, req)
	}
}

func copyFile(src string, dest string) error {
	if !storage.IsFile(src) {
		return fmt.Errorf("src not exist")
	}
	bytes, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	return os.WriteFile(dest, bytes, 0666)
}

func isAbs(p string) bool {
	return path.IsAbs(p) || (len(p) > 1 && p[1] == ':')
}

func dirSize(p string) (uint64, error) {
	entries, err := os.ReadDir(p)
	if err != nil {
		return 0, err
	}
	totalSize := uint64(0)
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			if errors.Is(err, os.ErrNotExist) {
				continue
			}
			return 0, err
		}
		totalSize += uint64(info.Size())
		if entry.IsDir() {
			sz, err := dirSize(path.Join(p, entry.Name()))
			if err != nil {
				return 0, err
			}
			totalSize += sz
		}
	}
	return totalSize, nil
}

func safeRemove(p string) error {
	if len(p) < 10 {
		errMsg := fmt.Sprintf("path is not considered safe to be removed:%v", p)
		logger.Error(errMsg)
		return fmt.Errorf(errMsg)
	}
	if storage.IsDir(p) {
		return os.RemoveAll(p)
	}
	return os.Remove(p)
}

var machineID string

func mustGenerateMachineID() string {
	var err error
	machineID, err = os.Hostname()
	if err != nil {
		log.Fatal(err)
	}
	return machineID
	machineID, err = machineid.ProtectedID("webbook-server")
	if err != nil {
		log.Fatal(err)
	}
	return machineID
}

func getDefaultDataDirectory() (s string) {
	defer func() {
		s = replacePathSeparatorWithForwardSlash(s)
	}()
	switch runtime.GOOS {
	case "darwin":
		return filepath.Join(os.Getenv("HOME"), "Desktop", "webbook-data")
	case "windows":
		return filepath.Join(os.Getenv("USERPROFILE"), "Desktop", "webbook-data")
	default:
		return filepath.Join(os.Getenv("HOME"), "webbook-data")
	}
}

func replacePathSeparatorWithForwardSlash(p string) string {
	return strings.ReplaceAll(p, "\\", "/")
}

func checkFileAccess(p string) error {
	p = path.Clean(p)
	p = replacePathSeparatorWithForwardSlash(p)
	if strings.Count(p, "/") < 1 {
		return fmt.Errorf("invalid path to check")
	}
	dir := path.Dir(p)
	if !storage.IsDir(dir) {
		err := os.MkdirAll(dir, 0777)
		if err != nil {
			return err
		}
		return nil
	}
	tmpFile := path.Join(dir, "webbook-check-file-access")
	err := os.WriteFile(tmpFile, []byte("check"), 0666)
	if err != nil {
		return fmt.Errorf("write error")
	}
	defer os.Remove(tmpFile)
	_, err = os.ReadFile(tmpFile)
	if err != nil {
		return fmt.Errorf("read error")
	}
	return nil
}
