import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { map, Observer, startWith } from 'rxjs';
import { randomString } from '../common';
import { EditPageInfoComponent } from '../edit-page-info/edit-page-info.component';
import { ExportAsComponent } from '../export-as/export-as.component';
import { GeneralInputDialogComponent, GeneralInputOptions } from '../general-input-dialog/general-input-dialog.component';
import { ConfirmData, MakeConfirmComponent } from '../make-confirm/make-confirm.component';
import { PageInfoDialogComponent } from '../page-info-dialog/page-info-dialog.component';
import { createRandomPage, ImportMethod, Page, PageSource, PageType, Rating } from '../page.model';
import { PageService } from '../service/page.service';
import { ToolBoxService } from '../tool-box.service';

interface Column {
  id: string
  widthWeight: number
  display: boolean
}

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit, AfterViewInit {

  unmarshalPage(objs: any[]): Page[] {
    return objs.map(x => {
      return {
        sourceUrl: x.sourceUrl,
        id: x.id,
        saveTime: moment(x.saveTime),
        updateTime: x.updateTime ? moment(x.updateTime) : undefined,
        remindReadingTime: x.remindReadingTime ? moment(x.remindReadingTime) : undefined,
        filePath: x.filePath,
        type: x.type as PageType,
        source: x.source as PageSource,
        method: x.method as ImportMethod,
        tags: x.tags,
        category: x.category,
        sourceTitle: x.sourceTitle,
        title: x.title,
        desc: x.desc,
        rating: x.rating as Rating,
        markedAsRead: x.markedAsRead,
      } as Page
    });
  }

  title = '已保存的网页';

  ngOnInit(): void {
  }

  categories: string[] = [];
  tags: string[] = [];

  select(option: MatListOption, t: MatSelectionList) {
    if (option.selected) {
      t.selectAll();
    } else {
      t.deselectAll();
    }
    this.selectCategory('');
  }

  unselectSelectAll(self: MatListOption, option: MatListOption) {
    if (!self.selected && option.selected) {
      option.selected = false;
    }
    this.selectCategory('');
  }

  list22: MatSelectionList;

  @ViewChild('list22', { static: false }) set content(content: MatSelectionList) {
    if (content) {
      this.list22 = content;
    }
  }

  selectCategory(where: string) {
    console.log(where);
    if (!this.list22) {
      return;
    }
    let values = this.list22.options.filter((item) => item.selected).map((item) => item.value);
    console.log(values);
    this.categoryFormControl.value?.splice(0, this.categoryFormControl.value?.length);
    this.categoryFormControl.value?.push(...values);
    this.categoryFormControl.updateValueAndValidity();
  }

  columnDefine: Column[] = [
    { id: 'title', widthWeight: 40, display: true },
    { id: 'category', widthWeight: 8, display: true },
    { id: 'id', widthWeight: 10, display: true },
    { id: 'sourceUrl', widthWeight: 30, display: false },
    { id: 'saveTime', widthWeight: 10, display: true },
    { id: 'rating', widthWeight: 10, display: true },
    { id: 'markedAsRead', widthWeight: 5, display: true },
    { id: 'remindReadingTime', widthWeight: 5, display: true },
    { id: 'menu', widthWeight: 5, display: true }];

  getDisplayedColumnWidth(id: string): string {
    let column = this.columnDefine.find(x => x.id == id)
    if (!column) {
      return 'width:0%;';
    }
    let sumOfWeights = this.columnDefine.filter(x => x.display).reduce<number>((x, y) => { return x + y.widthWeight; }, 0);
    if (sumOfWeights > 0) {
      // console.log(`${id} ${column.widthWeight} / ${sumOfWeights}`);
      return `width: ${Math.floor(column.widthWeight / sumOfWeights * 100)}%;`;
    }
    return 'width:0%';
  }
  displayedColumns: string[];
  defaultSortColumn = 'saveTime';
  dataSource: MatTableDataSource<Page>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  createNewCategoryAndSet(ev: CdkDragDrop<any, any, Page>) {
    const dialogRef = this.dialog.open(GeneralInputDialogComponent, { width: "300px", maxWidth: "40vw", data: { dialogTitle: "创建新类别", fieldName: "请输入" } as GeneralInputOptions });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result} `);
      if (result) {
        let page = ev.item.data;

        let thisRef = this;
        let old = page.category;
        page.category = result;
        this.pageService.update(page).subscribe({
          next(value) {

          },
          complete() {
          },
          error(err) {
            page.category = old;
            thisRef.toolbox.openSnackBar('创建失败', 'OK');
            thisRef.form.updateValueAndValidity();
            thisRef.onDataUpdated();

          },
        } as Observer<Page>)

        this.form.updateValueAndValidity();
        thisRef.onDataUpdated();
      }
    });

  }

  showCreateCategory = false;

  dragStarted() {
    this.showCreateCategory = true;
  }

  dragEnded() {
    this.showCreateCategory = false;
  }

  onChangeRating(r: Rating, row: Page) {
    let old = row.rating;
    let thisRef = this;
    row.rating = r;
    this.pageService.update(row).subscribe(
      {
        next(x: Page) {
        },
        complete() {
        },
        error(err) {
          row.rating = old;
          thisRef.toolbox.openSnackBar('修改失败', 'OK');
          thisRef.form.updateValueAndValidity();
          thisRef.onDataUpdated();
        },
      } as Observer<Page>);
    this.form.updateValueAndValidity();
    this.onDataUpdated();
  }

  onDataUpdated() {
    let x = this.dataSource.data;
    this.categories = [...new Set(x.map(x => x.category))];
    this.tags = [...new Set(x.map(x => x.tags).flat().filter(x => x.length > 0))];
  }

  isLoading = false;
  constructor(private toolbox: ToolBoxService, private pageService: PageService, public dialog: MatDialog) {
    moment.locale('zh-cn');

    this.displayedColumns = this.columnDefine.filter(x => x.display).map(x => x.id);

    // Create 100 users
    const users = Array.from({ length: 100 }, () => createRandomPage());

    // Assign the data to the data source for the table to render
    // this.dataSource = new MatTableDataSource(users);
    this.dataSource = new MatTableDataSource([] as Page[]);

    this.pageService.pageList().pipe(
      map(x => this.unmarshalPage(x)),
      startWith(function (c: LibraryComponent) {
        c.isLoading = true;
        return [];
      }(this)),
      // delay(1000),
    ).subscribe(
      x => {
        this.dataSource.data = x;
        this.onDataUpdated();
        this.isLoading = false;
      }
    )

    this.form.valueChanges.subscribe((value: any): void => {
      this.dataSource.filterPredicate = (data: Page, filter: string): boolean => {
        let isSearchMatch = (): boolean => {
          let search = value['search'] as string;
          search = search.toLowerCase();
          return search.length === 0 ||
            data.title.toLowerCase().includes(search) ||
            data.sourceUrl.toLowerCase().includes(search) /*||
            data.desc.toLowerCase().includes(search)*/;
        }

        let isTagsMatch = (): boolean => {
          let tags = value['tags'] as string[];
          let allMatch = value['matchAll'] as boolean;
          if (!allMatch) {
            return tags.length === 0 || tags.some(tag => tag !== '无标签' && data.tags.some(t => t === tag) ||
              tag === '无标签' && data.tags.length === 0);
          } else {
            return !tags.some(tag => tag === '无标签' && data.tags.length !== 0 ||
              tag !== '无标签' && !data.tags.some(t => t === tag));
          }
        }

        let isCategoryMatch = (): boolean => {
          let category = value['category'] as string[];
          return category.some(x => x === '_all' || x === data.category);
        }

        let isRatingMatch = (): boolean => {
          let rating = value['rating'] as string[];
          return rating.length === 0 || rating.some(x => data.rating.toString() === x);
        }

        return isCategoryMatch() && isTagsMatch() && isRatingMatch() && isSearchMatch();
      }

      this.dataSource.filter = randomString(10);
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  getCategoryDisplayName(category: string): string {
    return category.length > 0 ? category : '无类别';
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  searchFormControl = new FormControl('');
  ratingFormControl = new FormControl([] as number[]);
  tagsFormControl = new FormControl([] as string[]);
  categoryFormControl = new FormControl(['_all']);
  matchAllFormControl = new FormControl(false);
  form: FormGroup = new FormGroup({
    search: this.searchFormControl,
    rating: this.ratingFormControl,
    tags: this.tagsFormControl,
    category: this.categoryFormControl,
    matchAll: this.matchAllFormControl,
  });

  applyFilter(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openInBrowser(row: Page) {
    let url = `http://127.0.0.1:16224/view/${row.id}`;
    console.log(url);
    window.open(url, '_blank');
  }

  openEditDialog(row: Page) {
    const dialogRef = this.dialog.open(EditPageInfoComponent, { width: "40vw", maxWidth: "60vw", data: row });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openExportDialog(row: Page) {
    const dialogRef = this.dialog.open(ExportAsComponent, { maxWidth: "60vw", data: row });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onDroped(ev: CdkDragDrop<any, any, Page>, shoe: string) {
    // console.log(ev);

    let page = ev.item.data;


    let thisRef = this;
    let old = page.category;
    page.category = shoe;
    this.pageService.update(page).subscribe({
      next(value) {
      },
      complete() {
      },
      error(err) {
        page.category = old;
        thisRef.toolbox.openSnackBar('修改失败', 'OK');
        thisRef.form.updateValueAndValidity();
        thisRef.onDataUpdated();
      },
    } as Observer<Page>)


    this.form.updateValueAndValidity();
    this.onDataUpdated();
  }

  confirmDeletion(row: Page) {
    const dialogRef = this.dialog.open(MakeConfirmComponent, {
      maxWidth: "60vw",
      data: { prompt: "真的要删除吗？", yesText: "确认", noText: "取消" } as ConfirmData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // console.log('true');
        this.isLoading = true;
        let thisRef = this;
        this.pageService.delete(row.id).subscribe({
          complete() {
            thisRef.dataSource.data = thisRef.dataSource.data.filter(x => x.id != row.id);
            thisRef.isLoading = false;
            thisRef.toolbox.openSnackBar('已删除', 'OK');
          },
          error(err) {
            thisRef.isLoading = false;
            thisRef.toolbox.openSnackBar('删除失败，请重试', 'OK');
          },
        } as Observer<void>);
      }
    });
  }

  openPageInfoDialog(row: Page) {
    const dialogRef = this.dialog.open(PageInfoDialogComponent, { maxWidth: "60vw", data: row });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  preventMenuClosing(ev: Event) {
    ev.stopPropagation();
  }

  toggleMarkedAsRead(page: Page) {

    let thisRef = this;
    let old = page.markedAsRead;
    page.markedAsRead = !page.markedAsRead;
    this.pageService.update(page).subscribe({
      next(value) {

      },
      complete() {

      },
      error(err) {
        page.markedAsRead = old;
        thisRef.toolbox.openSnackBar('标记失败', 'OK');
        thisRef.form.updateValueAndValidity();
        thisRef.onDataUpdated();
      },
    } as Observer<Page>)

    this.form.updateValueAndValidity();
    this.onDataUpdated();
  }

  effectiveRemindTime(m: moment.Moment | undefined): moment.Moment | undefined {
    if (m === undefined) {
      return undefined;
    }
    if (moment().unix() + 1 > m.unix()) {
      return undefined;
    } else {
      return m;
    }
  }
}
