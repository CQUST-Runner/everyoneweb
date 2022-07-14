package storage

import (
	"fmt"

	gogoproto "github.com/gogo/protobuf/proto"
)

type Wal struct {
	f      File
	l      LogFormat
	header *FileHeader
	pos    int64
	broken bool

	readonly bool
}

func (w *Wal) Init(filename string, l LogFormat, readonly bool) error {
	f, err := OpenFile(filename, readonly)
	if err != nil {
		return err
	}

	valid, err := l.IsValidFile(f)
	if err != nil {
		return err
	}
	var header *FileHeader
	if !valid {
		if readonly {
			return fmt.Errorf("invalid wal file")
		}
		id, err := GenUUID()
		if err != nil {
			return err
		}
		header = &FileHeader{Id: id, FileEnd: HeaderSize}
		err = l.WriteHeader(f, header)
		if err != nil {
			return err
		}
	} else {
		header, err = l.ReadHeader(f)
		if err != nil {
			return err
		}
	}

	w.header = header
	w.f = f
	w.l = l
	w.pos = header.FileEnd
	w.broken = false
	w.readonly = readonly
	return nil
}

func (w *Wal) Close() error {
	if w.f == nil {
		return nil
	}
	err := w.f.Close()
	if err != nil {
		logger.Error("close wal file[%v] failed[%v]", w.f.Path(), err)
		return err
	}
	w.f = nil
	w.header = nil
	w.broken = false
	w.l = nil
	w.pos = 0
	return nil
}

func (w *Wal) Append(op int32, key string, value string) (string, error) {
	if w.broken {
		return "", fmt.Errorf("wal is broken")
	}
	if w.readonly {
		return "", fmt.Errorf("append to readonly file")
	}

	gid, err := GenUUID()
	if err != nil {
		return "", err
	}
	logOp := LogOperation{Op: op, Key: key, Value: value, Gid: gid}
	writeSz, err := w.l.AppendEntry(w.f, w.pos, &LogEntry{Ops: []*LogOperation{&logOp}})
	if err != nil {
		return "", err
	}
	if writeSz == 0 {
		return "", fmt.Errorf("write size is 0, suspicious")
	}

	newPos := w.pos + writeSz
	newHeader := gogoproto.Clone(w.header).(*FileHeader)
	newHeader.FileEnd = newPos
	newHeader.LastEntryId = gid
	err = w.l.WriteHeader(w.f, newHeader)
	// This should not be happen
	if err != nil {
		w.broken = true
		return "", err
	}

	w.pos = newPos
	w.header = newHeader
	return gid, nil
}

func execLogEntry(logOp *LogOperation, s Storage) error {
	switch logOp.Op {
	case int32(Op_Del):
		return s.WithCommitID(logOp.Gid).Del(logOp.Key)
	case int32(Op_Modify):
		return s.WithCommitID(logOp.Gid).Save(logOp.Key, logOp.Value)
	case int32(Op_Discard):
		return fmt.Errorf("unsupported op[%v]", logOp.Op)
	case int32(Op_None):
		return fmt.Errorf("unrecognized op[%v]", logOp.Op)
	default:
		return fmt.Errorf("unrecognized op[%v]", logOp.Op)
	}
}

func foreach(w *Wal, do func(logOp *LogOperation) bool) error {
	var pos int64 = HeaderSize
	for pos < w.header.FileEnd {
		entry := LogEntry{}
		readSz, err := w.l.ReadEntry(w.f, pos, &entry)
		if err != nil {
			return err
		}
		if readSz <= 0 {
			return fmt.Errorf("read size unexpected")
		}

		for _, logOp := range entry.Ops {
			if logOp == nil {
				continue
			}
			if !do(logOp) {
				break
			}
		}
		pos += readSz
	}
	return nil
}

// Replay start not included
func (w *Wal) Replay(s Storage, start string) error {
	if w.broken {
		return fmt.Errorf("wal is broken")
	}
	return foreachIn(w, func(logOp *LogOperation) bool {
		err := execLogEntry(logOp, s)
		if err != nil {
			return false
		}
		return true
	}, start, "")
}

func (w *Wal) Flush() error {
	if w.broken {
		return fmt.Errorf("wal is broken")
	}
	if w.readonly {
		return nil
	}

	return w.f.Flush()
}

func (w *Wal) Foreach(do func(logOp *LogOperation) bool) error {
	return foreach(w, do)
}

func foreachIn(w *Wal, do func(logOp *LogOperation) bool, start string, end string) error {
	preInRange := false
	inRange := len(start) == 0
	var e error
	err := foreach(w, func(logOp *LogOperation) bool {
		if len(start) > 0 && logOp.Gid == start {
			preInRange = true
		}
		if preInRange {
			inRange = true
			preInRange = false
		}
		if len(end) > 0 && logOp.Gid == end && inRange {
			inRange = false
			return false
		}
		if inRange {
			if !do(logOp) {
				return false
			}
		}
		return true
	})

	if err != nil {
		return err
	}
	return e
}

func (w *Wal) Range(start string, end string, do func(logOp *LogOperation) bool) error {
	return foreachIn(w, do, start, end)
}
