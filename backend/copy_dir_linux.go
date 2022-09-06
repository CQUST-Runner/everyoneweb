package main

func copyDir(src string, dest string) error {
	// remove ending slash
	src = path.Clean(src)
	cmd := exec.Command("cp", "-r", src+"/.", dest)
	return cmd.Run()
}
