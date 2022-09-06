package main

import (
	"os/exec"
	"path"
)

func copyDir(src string, dest string) error {
	// remove ending slash
	src = path.Clean(src)
	cmd := exec.Command("robocopy", src, dest, "/E")
	return cmd.Run()
}
