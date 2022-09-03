import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { map, Observer, startWith } from 'rxjs';
import { randomString } from '../common';
import { EditPageData, EditPageInfoComponent } from '../edit-page-info/edit-page-info.component';
import { ExportAsComponent } from '../export-as/export-as.component';
import { GeneralInputDialogComponent, GeneralInputOptions } from '../general-input-dialog/general-input-dialog.component';
import { ConfirmData, MakeConfirmComponent } from '../make-confirm/make-confirm.component';
import { MoveToDialogComponent } from '../move-to-dialog/move-to-dialog.component';
import { PageInfoDialogComponent } from '../page-info-dialog/page-info-dialog.component';
import { createRandomPage, Page, Rating, unmarshalPage } from '../page.model';
import { PageService } from '../service/page.service';
import { getConfig } from '../settings.model';
import { ToolBoxService } from '../tool-box.service';

export interface Column {
  id: string
  widthWeight: number
  display: boolean
  displayName: string
  configurable: boolean
}

// weight should not be changed by users
export let columnDefine: Column[] = [
  { id: 'dragHandle', widthWeight: 2, display: true, displayName: "", configurable: false },
  { id: 'select', widthWeight: 2, display: true, displayName: "", configurable: false },
  { id: 'title', widthWeight: 30, display: true, displayName: "标题", configurable: true },
  { id: 'category', widthWeight: 5, display: true, displayName: "类别", configurable: true },
  { id: 'id', widthWeight: 10, display: true, displayName: "短链接", configurable: true },
  { id: 'sourceUrl', widthWeight: 30, display: false, displayName: "原链接", configurable: true },
  { id: 'saveTime', widthWeight: 10, display: true, displayName: "保存时间", configurable: true },
  { id: 'rating', widthWeight: 10, display: true, displayName: "评级", configurable: true },
  { id: 'markedAsRead', widthWeight: 5, display: true, displayName: "已读", configurable: true },
  { id: 'remindReadingTime', widthWeight: 5, display: true, displayName: "计划阅读", configurable: true },
  { id: 'preview', widthWeight: 5, display: true, displayName: "预览", configurable: true },
  { id: 'menu', widthWeight: 5, display: true, displayName: "菜单", configurable: false },];

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'hidden', })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])],
})
export class LibraryComponent implements OnInit, AfterViewInit {


  title = '网页库';

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

  getDisplayedColumnWidth(id: string): string {
    let column = columnDefine.find(x => x.id == id)
    if (!column) {
      return 'width:0%;';
    }
    let sumOfWeights = columnDefine.filter(x => x.display).reduce<number>((x, y) => { return x + y.widthWeight; }, 0);
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

    if (!ev.isPointerOverContainer) {
      return;
    }

    const dialogRef = this.dialog.open(GeneralInputDialogComponent, { width: "300px", maxWidth: "40vw", data: { dialogTitle: "创建新类别", fieldName: "请输入" } as GeneralInputOptions });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result} `);
      if (result) {
        let selected = this.activelySelected();
        if (selected.some(x => x.id === ev.item.data.id) && selected.length > 1) {
          for (let p of selected) {
            this.setCategory(p, result);
          }
        } else {
          let page = ev.item.data;
          this.setCategory(page, result);
        }
      }
    });
  }

  showCreateCategory = false;

  dragStarted() {
    if (this.tr) {
      if (this.nodeAfter) {
        this.tbody?.insertBefore(this.tr, this.nodeAfter);
      } else {
        this.tbody?.appendChild(this.tr);
      }
    }

    this.showCreateCategory = true;
  }

  dragEnded() {
    this.showCreateCategory = false;
    if (this.tr && this.tbody?.contains(this.tr)) {
      this.tbody?.removeChild(this.tr);
    }
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

  @ViewChild('list33', { read: ElementRef }) listRef: ElementRef;

  onDataUpdated() {
    let x = this.dataSource.data;
    this.categories = [...new Set(x.map(x => x.category))];
    this.tags = [...new Set(x.map(x => x.tags).flat().filter(x => x.length > 0))];
  }

  scroll(ev: number) {
    this.listRef.nativeElement.scrollTop += ev;
  }

  tbody: HTMLElement | undefined;
  tr: Node | undefined;
  nodeAfter: Node | undefined;
  prepareDrag(cell: HTMLTableCellElement) {
    let tr = cell.parentElement!;
    let tbody = tr.parentElement!;

    let i = Array.prototype.indexOf.call(tbody.children, tr);
    this.tbody = tbody;
    this.tr = tr.cloneNode(true);
    if (i < tbody.children.length - 1) {
      this.nodeAfter = tbody.children[i + 1];
    } else {
      this.nodeAfter = undefined;
    }

    this.disabled = false;
  }

  endDrag(cell: HTMLTableCellElement) {
    if (this.tr && this.tbody?.contains(this.tr)) {
      this.tbody?.removeChild(this.tr);
    }
    this.tbody = undefined;
    this.tr = undefined;
    this.nodeAfter = undefined;

    this.disabled = true;
  }

  disabled = true;
  isLoading = false;
  constructor(public toolbox: ToolBoxService, private pageService: PageService, public dialog: MatDialog) {
    moment.locale('zh-cn');

    let columns = getConfig().columns;
    if (columns) {
      this.displayedColumns = columns.filter(x => x.display).filter(x => columnDefine.some(y => x.id == y.id)).map(x => x.id);
      this.displayedColumns.push(...columnDefine.filter(x => x.configurable && x.display && !columns.some(y => y.id == x.id)).map(x => x.id));
      this.displayedColumns = ['dragHandle', ...this.displayedColumns];
      this.displayedColumns.push('menu');
    } else {
      this.displayedColumns = columnDefine.filter(x => x.display).map(x => x.id);
    }

    // Create 100 users
    const users = Array.from({ length: 100 }, () => createRandomPage());

    // Assign the data to the data source for the table to render
    // this.dataSource = new MatTableDataSource(users);
    this.dataSource = new MatTableDataSource([] as Page[]);

    this.dataSource.sortingDataAccessor = (data, sortHeaderId): string | number => {
      switch (sortHeaderId) {
        case 'remindReadingTime':
          return data.remindReadingTime ? data.remindReadingTime.format('YYYY/MM/DD HH:mm') : '';
        default: return (data as any)[sortHeaderId];
      }
    }

    this.pageService.pageList().pipe(
      map(x => unmarshalPage(x)),
      startWith(function (c: LibraryComponent) {
        c.isLoading = true;
        return [];
      }(this)),
      // delay(1000),
    ).subscribe(
      x => {
        this.dataSource.data = x.sort((a, b) => {
          let aSaveTime = a.saveTime.format('YYYY/MM/DD HH:mm');
          let bSaveTime = b.saveTime.format('YYYY/MM/DD HH:mm');
          if (aSaveTime > bSaveTime) {
            return 1;
          } else if (aSaveTime < bSaveTime) {
            return -1;
          } else {
            return 0;
          }
        });
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
    const dialogRef = this.dialog.open(EditPageInfoComponent, { width: "40vw", maxWidth: "60vw", data: { page: row, categories: this.categories, tags: this.tags } as EditPageData });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${JSON.stringify(result)}`);
        let i = this.dataSource.data.findIndex(x => x.id == row.id);
        if (i >= 0) {
          let copy = this.dataSource.data.slice();
          copy[i] = result;
          this.dataSource.data = copy;
          this.onDataUpdated();
        }
      }
    });
  }

  openExportDialog(row: Page) {
    const dialogRef = this.dialog.open(ExportAsComponent, { maxWidth: "60vw", data: row });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  setCategory(page: Page, category: string) {

    let thisRef = this;
    let old = page.category;
    page.category = category;
    this.pageService.update(page).subscribe({
      next(value) {
      },
      complete() {
        thisRef.form.updateValueAndValidity();
        thisRef.onDataUpdated();
      },
      error(err) {
        page.category = old;
        thisRef.toolbox.openSnackBar('修改失败', 'OK');
        thisRef.form.updateValueAndValidity();
        thisRef.onDataUpdated();
      },
    } as Observer<Page>);

    this.form.updateValueAndValidity();
    this.onDataUpdated();
  }

  onDroped(ev: CdkDragDrop<any, any, Page>, shoe: string) {
    // console.log(ev);

    if (!ev.isPointerOverContainer) {
      return;
    }
    let page = ev.item.data;

    let selected = this.activelySelected();
    if (selected.some(x => x.id === ev.item.data.id) && selected.length > 1) {
      for (let p of selected) {
        this.setCategory(p, shoe);
      }
    } else {
      this.setCategory(page, shoe);
    }
  }

  updateRemindReadingTime(page: Page, m: moment.Moment | null) {
    this.isLoading = true;
    let thisRef = this;
    let old = page.remindReadingTime;
    page.remindReadingTime = m;
    this.pageService.update(page).subscribe({
      next(value) {
        thisRef.isLoading = false;
      },
      complete() {
        thisRef.isLoading = false;
      },
      error(err) {
        thisRef.isLoading = false;
        page.remindReadingTime = old;
        thisRef.toolbox.openSnackBar('设置失败', 'OK');
        thisRef.form.updateValueAndValidity();
        thisRef.onDataUpdated();
      },
    } as Observer<Page>)

    this.form.updateValueAndValidity();
    this.onDataUpdated();
  }

  deletePage(p: Page) {
    // console.log('true');
    this.isLoading = true;
    let thisRef = this;
    this.pageService.delete(p.id).subscribe({
      complete() {
        thisRef.dataSource.data = thisRef.dataSource.data.filter(x => x.id != p.id);
        thisRef.isLoading = false;
        thisRef.toolbox.openSnackBar('已删除', 'OK');
      },
      error(err) {
        thisRef.isLoading = false;
        thisRef.toolbox.openSnackBar(`删除【${p.title}】失败，请重试`, 'OK');
      },
    } as Observer<void>);

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
        this.deletePage(row);
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

  setMarkAsRead(page: Page, b: boolean) {
    let thisRef = this;
    let old = page.markedAsRead;
    page.markedAsRead = b;
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
    } as Observer<Page>);

    this.form.updateValueAndValidity();
    this.onDataUpdated();
  }

  toggleMarkedAsRead(page: Page) {
    this.setMarkAsRead(page, !page.markedAsRead);
    this.form.updateValueAndValidity();
    this.onDataUpdated();
  }

  isPartiallySelected(): boolean {
    return this.selection.selected.some(x => this.dataSource.filteredData.some(y => y.id === x.id));
  }

  selection = new SelectionModel<Page>(true, []);
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return !this.dataSource.filteredData.some(x => !this.selection.selected.some(y => y.id === x.id));
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {

      this.selection.deselect(...this.selection.selected.filter(x => this.dataSource.filteredData.some(y => y.id === x.id)));
      return;
    }

    this.selection.select(...this.dataSource.filteredData);
  }

  activelySelected(): Page[] {
    return this.selection.selected.filter(x => this.dataSource.filteredData.some(y => y.id === x.id));
  }

  deleteSelected() {

    let selected = this.activelySelected();
    if (selected.length == 0) {
      return;
    }

    const dialogRef = this.dialog.open(MakeConfirmComponent, {
      maxWidth: "60vw",
      data: { prompt: `真的要删除【${selected[0].title}】${selected.length > 1 ? '等 ' + selected.length.toString() + ' 篇文档' : ''}吗？`, yesText: "确认", noText: "取消" } as ConfirmData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        for (let p of selected) {
          this.deletePage(p);
        }
      }
    });
  }

  moveSelected() {

    let selected = this.activelySelected();
    if (selected.length == 0) {
      return;
    }

    const dialogRef = this.dialog.open(MoveToDialogComponent, { width: "300px", maxWidth: "40vw", data: this.categories });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        for (let p of selected) {
          this.setCategory(p, result);
        }
      }
    });
  }

  markReadSelected() {
    let selected = this.activelySelected();
    if (selected.length == 0) {
      return;
    }

    for (let p of selected) {
      this.setMarkAsRead(p, true);
    }
  }

  getPreviewMessage(p: Page) {
    let n = this.activelySelected().length;
    if (this.selection.selected.some(x => p.id === x.id) && n > 1) {
      return `${p.title}以及其他 ${n - 1} 个项目`
    } else {
      return p.title;
    }
  }
}
