package main

import (
	"os/exec"
	"path"
)

func copyDir(src string, dest string) error {
	// remove ending slash
	src = path.Clean(src)
	// https://unix.stackexchange.com/a/180987
	cmd := exec.Command("cp", "-R", src+"/.", dest)
	return cmd.Run()
}
