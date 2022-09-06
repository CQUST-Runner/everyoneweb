package main

import (
	"fmt"
	"os/exec"
	"path"
)

func copyDir(src string, dest string) error {
	// remove ending slash
	src = path.Clean(src)
	cmd := exec.Command("robocopy", src, dest, "/E", "/IS", "/IT")
	err := cmd.Start()
	if err != nil {
		return err
	}
	state, err := cmd.Process.Wait()
	if err != nil {
		return err
	}
	if state.ExitCode() != 1 {
		return fmt.Errorf("robocopy returns %v", state.ExitCode())
	}
	return nil
}
