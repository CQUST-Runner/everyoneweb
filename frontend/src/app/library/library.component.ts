import { group } from '@angular/animations';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { randomString } from '../common';
import { EditPageInfoComponent } from '../edit-page-info/edit-page-info.component';
import { ExportAsComponent } from '../export-as/export-as.component';
import { ConfirmData, MakeConfirmComponent } from '../make-confirm/make-confirm.component';
import { PageInfoDialogComponent } from '../page-info-dialog/page-info-dialog.component';
import { createRandomPage, Page } from '../page.model';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit, AfterViewInit {

  title = '已保存的网页';

  ngOnInit(): void {
  }
  typesOfShoes: string[] = [
    'Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry', '无标签'];


  color: ThemePalette = 'accent';

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

  displayedColumns: string[] = ['title', 'category', 'id', /*'sourceUrl',*/ 'saveTime', 'rating', 'remindReadingTime', 'menu'];
  dataSource: MatTableDataSource<Page>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog) {
    moment.locale('zh-cn');
    // Create 100 users
    const users = Array.from({ length: 100 }, () => createRandomPage());

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(users);
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
    window.open(`http://localhost:4200/page/${row.id}`, '_blank');
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
    ev.item.data.category = shoe;
    this.form.updateValueAndValidity();
  }

  confirmDeletion(row: Page) {
    const dialogRef = this.dialog.open(MakeConfirmComponent, {
      maxWidth: "60vw",
      data: { prompt: "真的要删除吗？", yesText: "确认", noText: "取消" } as ConfirmData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // console.log('true');
        this.dataSource.data = this.dataSource.data.filter(x => x.id != row.id);
      }
    });
  }

  openPageInfoDialog(row: Page) {
    const dialogRef = this.dialog.open(PageInfoDialogComponent, { maxWidth: "60vw", data: row });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }


  public date: moment.Moment;
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public minDate: moment.Moment;
  public maxDate: moment.Moment;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;

  public dateControl = new FormControl(new Date(2021, 9, 4, 5, 6, 7));

  preventMenuClosing(ev: Event) {
    ev.stopPropagation();
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
