package storage

import (
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

const fileName = "test.db"
const tableName = "test"
const machineName = "machine0"

func getDB(t assert.TestingT) *SqliteAdapter {
	_, err := os.Stat(fileName)
	if err == nil {
		err := os.Remove(fileName)
		assert.Nil(t, err)
	}
	a := SqliteAdapter{}
	err = a.Init(fileName, tableName, machineName)
	assert.Nil(t, err)
	return &a
}

func getDBFile(t assert.TestingT) string {
	_, err := os.Stat(fileName)
	if err == nil {
		err := os.Remove(fileName)
		assert.Nil(t, err)
	}
	return fileName
}

func delDBFile() {
	err := os.Remove(fileName)
	if err != nil {
		fmt.Println(err)
	}

	journalFile := fileName + "-journal"
	_, err = os.Stat(journalFile)
	if err != nil {
		return
	}
	err = os.Remove(journalFile)
	if err != nil {
		fmt.Println(err)
	}
}

func TestInit(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()
	_ = a
}

func TestSave(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	const key = "test1"
	const valuePrefix = "testVal"

	err := a.Save(key, valuePrefix+"1")
	assert.Nil(t, err)

	err = a.Save(key, valuePrefix+"2")
	assert.Nil(t, err)
}

func TestLoad(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	const key = "test1"
	const valuePrefix = "testVal"

	err := a.Save(key, valuePrefix+"1")
	assert.Nil(t, err)

	val, err := a.Load(key)
	assert.Nil(t, err)
	assert.Equal(t, valuePrefix+"1", val)

	err = a.Save(key, valuePrefix+"2")
	assert.Nil(t, err)

	val, err = a.Load(key)
	assert.Nil(t, err)
	assert.Equal(t, valuePrefix+"2", val)
}

func TestHas(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	const key = "test1"
	const valuePrefix = "testVal"

	has, err := a.Has(key)
	assert.Nil(t, err)
	assert.False(t, has)

	err = a.Save(key, valuePrefix+"1")
	assert.Nil(t, err)

	has, err = a.Has(key)
	assert.Nil(t, err)
	assert.True(t, has)
}

func TestDel(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	const key = "test1"
	const valuePrefix = "testVal"

	err := a.Save(key, valuePrefix+"1")
	assert.Nil(t, err)

	has, err := a.Has(key)
	assert.Nil(t, err)
	assert.True(t, has)

	err = a.Del(key)
	assert.Nil(t, err)

	has, err = a.Has(key)
	assert.Nil(t, err)
	assert.False(t, has)
}

func TestAll(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	const key1 = "test1"
	const key2 = "test2"
	const valuePrefix = "testVal"

	err := a.Save(key1, valuePrefix+"1")
	assert.Nil(t, err)

	err = a.Save(key2, valuePrefix+"2")
	assert.Nil(t, err)

	records, err := a.All()
	assert.Nil(t, err)
	m := map[string]string{}
	for _, rec := range records {
		if len(rec) >= 2 {
			m[rec[0]] = rec[1]
		}
	}

	_, ok := m[key1]
	assert.True(t, ok)
	assert.Equal(t, valuePrefix+"1", m[key1])
	_, ok = m[key2]
	assert.True(t, ok)
	assert.Equal(t, valuePrefix+"2", m[key2])
}

func TestLastCommit(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	id, err := a.LastCommit()
	assert.Nil(t, err)
	assert.Equal(t, "", id)
}

func TestLastSync(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	status, err := a.LastSync()
	assert.Nil(t, err)
	assert.Equal(t, fmt.Sprint(map[string]string{}), fmt.Sprint(status.Pos))

	newStatus := SyncStatus{Pos: map[string]string{"1": "2"}}
	err = a.SaveLastSync(status, &newStatus)
	assert.Nil(t, err)

	status, err = a.LastSync()
	assert.Nil(t, err)
	assert.Equal(t, fmt.Sprint(newStatus.Pos), fmt.Sprint(status.Pos))

	newStatus = SyncStatus{Pos: map[string]string{"3": "4"}}
	err = a.SaveLastSync(status, &newStatus)
	assert.Nil(t, err)

	status, err = a.LastSync()
	assert.Nil(t, err)
	assert.Equal(t, fmt.Sprint(map[string]string{"1": "2", "3": "4"}), fmt.Sprint(status.Pos))
}

func TestTransaction(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	const testKey = "testKey"
	const testValue = "testValue"

	err := a.Transaction(func(s *SqliteAdapter) error {
		err := s.Save(testKey+"1", testValue+"1")
		assert.Nil(t, err)

		_ = s.Transaction(func(s2 *SqliteAdapter) error {
			err := s2.Save(testKey+"2", testValue+"2")
			assert.Nil(t, err)
			return fmt.Errorf("rollback")
		})
		return nil
	})
	assert.Nil(t, err)

	has, err := a.Has(testKey + "1")
	assert.Nil(t, err)
	assert.True(t, has)
	has, err = a.Has(testKey + "2")
	assert.Nil(t, err)
	assert.False(t, has)
}

func TestRollbackOuterTransaction(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	const testKey = "testKey"
	const testValue = "testValue"

	err := a.Transaction(func(s *SqliteAdapter) error {
		err := s.Save(testKey+"1", testValue+"1")
		assert.Nil(t, err)

		return s.Transaction(func(s2 *SqliteAdapter) error {
			err := s2.Save(testKey+"2", testValue+"2")
			assert.Nil(t, err)
			return fmt.Errorf("rollback")
		})
	})
	assert.NotNil(t, err)

	has, err := a.Has(testKey + "1")
	assert.Nil(t, err)
	assert.False(t, has)
	has, err = a.Has(testKey + "2")
	assert.Nil(t, err)
	assert.False(t, has)
}

func TestRollbackInnerTransaction(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	const testKey = "testKey"
	const testValue = "testValue"

	err := a.Transaction(func(s *SqliteAdapter) error {
		err := s.Transaction(func(s2 *SqliteAdapter) error {
			err := s2.Save(testKey+"2", testValue+"2")
			assert.Nil(t, err)
			return nil
		})
		assert.Nil(t, err)

		err = s.Save(testKey+"1", testValue+"1")
		assert.Nil(t, err)
		return fmt.Errorf("rollback")
	})
	assert.NotNil(t, err)

	has, err := a.Has(testKey + "1")
	assert.Nil(t, err)
	assert.False(t, has)
	has, err = a.Has(testKey + "2")
	assert.Nil(t, err)
	assert.False(t, has)
}

func TestMachineID(t *testing.T) {
	t.Cleanup(delDBFile)
	a := getDB(t)
	defer a.Close()

	const testKey = "testKey"
	const testValue = "testValue"
	const machinePrefix = "machine"

	err := a.WithMachineID(machinePrefix+"1").Save(testKey+"1", testValue+"1")
	assert.Nil(t, err)
	err = a.WithMachineID(machinePrefix+"2").Save(testKey+"2", testValue+"2")
	assert.Nil(t, err)
	err = a.WithMachineID(machinePrefix+"3").Save(testKey+"3", testValue+"3")
	assert.Nil(t, err)

	records, err := a.WithMachineID(machinePrefix + "1").All()
	assert.Nil(t, err)
	assert.Equal(t, int(1), len(records))
	assert.Equal(t, [2]string{testKey + "1", testValue + "1"}, records[0])

	records, err = a.WithMachineID(machinePrefix + "2").All()
	assert.Nil(t, err)
	assert.Equal(t, int(1), len(records))
	assert.Equal(t, [2]string{testKey + "2", testValue + "2"}, records[0])

	records, err = a.WithMachineID(machinePrefix + "3").All()
	assert.Nil(t, err)
	assert.Equal(t, int(1), len(records))
	assert.Equal(t, [2]string{testKey + "3", testValue + "3"}, records[0])

	err = a.WithMachineID(machinePrefix + "2").Del(testKey + "2")
	assert.Nil(t, err)

	records, err = a.WithMachineID("").All()
	assert.Nil(t, err)
	assert.Equal(t, int(2), len(records))
	assert.ElementsMatch(t,
		[][2]string{{testKey + "1", testValue + "1"}, {testKey + "3", testValue + "3"}},
		records)
}
