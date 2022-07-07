package storage

import (
	"encoding/binary"
	"fmt"
	"hash/crc32"
	"io"
	math "math"
)

type BinLog struct {
}

// 写失败将破坏文件数据
func (l *BinLog) WriteHeader(f File, header *FileHeader) error {
	_, err := f.Seek(0, io.SeekStart)
	if err != nil {
		return err
	}

	headBuffer := [HeaderSize]byte{}
	n, err := header.MarshalToSizedBuffer(headBuffer[:])
	if err != nil {
		return err
	}
	_ = n

	n, err = f.Write(headBuffer[:])
	if err != nil {
		return err
	}
	if n != len(headBuffer) {
		return fmt.Errorf("write size unexpected")
	}
	return nil
}

// TODO: 更多校验
func (l *BinLog) IsValidFile(f File) (bool, error) {
	fSize, err := f.Seek(0, io.SeekEnd)
	if err != nil {
		return false, err
	}
	if fSize < HeaderSize {
		return false, nil
	}
	return true, nil
}

func (l *BinLog) ReadHeader(f File) (*FileHeader, error) {
	valid, err := l.IsValidFile(f)
	if err != nil {
		return nil, err
	}
	if !valid {
		return nil, fmt.Errorf("invalid file")
	}

	_, err = f.Seek(0, io.SeekStart)
	if err != nil {
		return nil, err
	}
	headerBuffer := [HeaderSize]byte{}
	n, err := f.Read(headerBuffer[:])
	if err != nil {
		return nil, err
	}
	if n != HeaderSize {
		return nil, fmt.Errorf("read size not expected")
	}

	header := FileHeader{}
	err = header.Unmarshal(headerBuffer[:])
	if err != nil {
		return nil, err
	}
	return &header, nil
}

// 写失败将破坏文件数据
func (l *BinLog) AppendEntry(f File, pos int64, entry *LogEntry) error {
	valid, err := l.IsValidFile(f)
	if err != nil {
		return err
	}
	if !valid {
		return fmt.Errorf("invalid file")
	}

	sz := entry.Size()
	if sz == 0 {
		return nil
	}

	if pos != -1 {
		if pos < HeaderSize {
			return fmt.Errorf("invalid pos")
		}
		_, err := f.Seek(pos, io.SeekStart)
		if err != nil {
			return err
		}
	} else {
		_, err := f.Seek(0, io.SeekEnd)
		if err != nil {
			return err
		}
	}

	writeSize := sz + 8
	if writeSize > math.MaxUint32 {
		return fmt.Errorf("log entry too large")
	}
	entryBuffer := make([]byte, writeSize, writeSize)
	_, err = entry.MarshalToSizedBuffer(entryBuffer[4 : len(entryBuffer)-4])
	if err != nil {
		return err
	}
	binary.LittleEndian.PutUint32(entryBuffer[0:4], uint32(sz))
	crcSum := crc32.ChecksumIEEE(entryBuffer[4 : len(entryBuffer)-4])
	binary.LittleEndian.PutUint32(entryBuffer[len(entryBuffer)-4-1:], crcSum)

	writeSz, err := f.Write(entryBuffer)
	if err != nil {
		return err
	}
	if writeSz != len(entryBuffer) {
		return fmt.Errorf("write size not expected")
	}
	return nil
}

func (l *BinLog) ReadEntry(f File, pos int64, entry *LogEntry) (int64, error) {
	_, err := f.Seek(pos, io.SeekStart)
	if err != nil {
		return 0, err
	}

	sizeBuffer := [4]byte{}
	readSz, err := f.Read(sizeBuffer[:])
	if err != nil {
		return 0, err
	}
	if readSz != len(sizeBuffer) {
		return 0, fmt.Errorf("read size unexpected")
	}

	size := binary.LittleEndian.Uint32(sizeBuffer[:])
	if size == 0 {
		return 4, nil
	}

	entryBuffer := make([]byte, size, size)
	readSz, err = f.Read(entryBuffer)
	if err != nil {
		return 0, err
	}
	if readSz != len(entryBuffer) {
		return 0, fmt.Errorf("read size unexpected")
	}

	crcSumBuffer := [4]byte{}
	readSz, err = f.Read(crcSumBuffer[:])
	if err != nil {
		return 0, err
	}
	if readSz != len(crcSumBuffer) {
		return 0, fmt.Errorf("read size unexpected")
	}

	crcSumRead := binary.LittleEndian.Uint32(crcSumBuffer[:])
	crcSumCalc := crc32.ChecksumIEEE(entryBuffer)
	if crcSumCalc != crcSumRead {
		return 0, fmt.Errorf("crc checksum mismatch pos[%v]", pos)
	}

	err = entry.Unmarshal(entryBuffer)
	if err != nil {
		return 0, err
	}
	return int64(size + 8), nil
}

func _() {
	var _ LogFile = &BinLog{}
}
