package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

const apiPrefix = "http://127.0.0.1:16224/api"

func randPage() *Page {
	p := Page{}
	p.Category = "Boots"
	p.Tags = []string{"Lemon", "Apple", "Lime"}
	p.SourceUrl = randID(IDLength)
	p.Tp = PageTypeSinglePage
	p.Source = PageSourceWebApp
	p.Desc = "1111122222"
	p.Method = ImportMethodSave
	now := time.Now()
	p.SaveTime = &now
	return &p
}

func testSavePage(p *Page) (*Page, error) {
	val, err := json.Marshal(p)
	if err != nil {
		return nil, err
	}
	resp, err := http.Post(apiPrefix+"/page/new", "text/json", bytes.NewReader(val))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code:%v", resp.StatusCode)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	newPage := Page{}
	err = json.Unmarshal(body, &newPage)
	if err != nil {
		return nil, err
	}
	return &newPage, nil
}

func TestSavePage(t *testing.T) {
	p := randPage()
	_, err := testSavePage(p)
	assert.Nil(t, err)
}

func testGetPage(id string) (*Page, error) {
	resp, err := http.Get(apiPrefix + "/page/" + id)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code:%v", resp.StatusCode)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	fmt.Println(string(body))
	p := Page{}
	err = json.Unmarshal(body, &p)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func TestGetPage(t *testing.T) {
	page := randPage()
	newPage, err := testSavePage(page)
	assert.Nil(t, err)
	result, err := testGetPage(newPage.Id)
	assert.Nil(t, err)
	assert.NotNil(t, result)
	fmt.Println(result)
}

func testDeletePage(id string) error {
	req, err := http.NewRequest(http.MethodDelete, apiPrefix+"/page/"+id, nil)
	if err != nil {
		return err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("status code:%v", resp.StatusCode)
	}
	return nil
}

func TestDeletePage(t *testing.T) {
	page := randPage()
	newPage, err := testSavePage(page)
	assert.Nil(t, err)
	err = testDeletePage(newPage.Id)
	assert.Nil(t, err)
	_, err = testGetPage(newPage.Id)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Sprintf("status code:%v", http.StatusNotFound), err.Error())
}

func testUpdatePage(p *Page) error {
	val, err := json.Marshal(p)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPatch, apiPrefix+"/page/"+p.Id, bytes.NewReader(val))
	if err != nil {
		return err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("status code:%v", resp.StatusCode)
	}

	v, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	updatedPage := Page{}
	err = json.Unmarshal(v, &updatedPage)
	if err != nil {
		return err
	}
	if updatedPage.Id != p.Id {
		return fmt.Errorf("updated page not expected")
	}
	return nil
}

func TestUpdatePage(t *testing.T) {
	page := randPage()
	newPage, err := testSavePage(page)
	assert.Nil(t, err)
	newPage.Title = "TestUpdatePage"
	err = testUpdatePage(newPage)
	assert.Nil(t, err)
	check, err := testGetPage(newPage.Id)
	assert.Nil(t, err)
	assert.Equal(t, newPage.Title, check.Title)
}

func testGetAllPages() ([]*Page, error) {
	resp, err := http.Get(apiPrefix + "/pageList")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code:%v", resp.StatusCode)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	// fmt.Println(string(body))
	pages := []*Page{}
	err = json.Unmarshal(body, &pages)
	if err != nil {
		return nil, err
	}
	return pages, nil
}

func TestGetAllPages(t *testing.T) {
	page := randPage()
	_, err := testSavePage(page)
	assert.Nil(t, err)
	pages, err := testGetAllPages()
	assert.Nil(t, err)
	assert.Greater(t, len(pages), 0)
	t.Logf("page number is %v", len(pages))
}
