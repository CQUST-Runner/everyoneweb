import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { ThemePalette } from '@angular/material/core';
import { MatSelectionList } from '@angular/material/list';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditPageInfoComponent } from '../edit-page-info/edit-page-info.component';
import { ExportAsComponent } from '../export-as/export-as.component';
import { ConfirmData, MakeConfirmComponent } from '../make-confirm/make-confirm.component';
import * as moment from 'moment';
import { PageInfoDialogComponent } from '../page-info-dialog/page-info-dialog.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ImportMethod, Page, PageSource, PageType, Rating } from '../page.model';

export interface UserData {
  id: string;
  name: string;
  progress: string;
  fruit: string;
}

const FRUITS: string[] = [
  'blueberry',
  'lychee',
  'kiwi',
  'mango',
  'peach',
  'lime',
  'pomegranate',
  'pineapple',
];
const NAMES: string[] = [
  'Maia',
  'Asher',
  'Olivia',
  'Atticus',
  'Amelia',
  'Jack',
  'Charlotte',
  'Theodore',
  'Isla',
  'Oliver',
  'Isabella',
  'Jasper',
  'Cora',
  'Levi',
  'Violet',
  'Arthur',
  'Mia',
  'Thomas',
  'Elizabeth',
];


@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit, AfterViewInit {


  ngOnInit(): void {
  }
  typesOfShoes: string[] = [
    'Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

  fruits: string[] = [];
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry', '无标签'];


  color: ThemePalette = 'accent';

  select(b: boolean, t: MatSelectionList) {
    if (b) {
      t.selectAll();
    } else {
      t.deselectAll();
    }
  }

  displayedColumns: string[] = ['name', 'progress', 'fruit', 'menu'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog) {
    // Create 100 users
    const users = Array.from({ length: 100 }, (_, k) => createNewUser(k + 1));

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(users);

    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allFruits.slice())),
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openEditDialog() {
    const dialogRef = this.dialog.open(EditPageInfoComponent, { width: "80vw" });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openExportDialog() {
    const dialogRef = this.dialog.open(ExportAsComponent, { width: "80vw" });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  confirmDeletion() {
    const dialogRef = this.dialog.open(MakeConfirmComponent, {
      width: "80vw",
      data: { prompt: "真的要删除吗？", yesText: "确认", noText: "取消" } as ConfirmData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openPageInfoDialog() {
    const dialogRef = this.dialog.open(PageInfoDialogComponent, { width: "80vw" });

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


  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl('');
  filteredFruits: Observable<string[]>;

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.fruitCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().includes(filterValue));
  }
}

const RANDOM_ID_SOURCE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789__________";
const RANDOM_STRING_SOURCE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz     ";

function randomID(length: number): string {
  let s = '';
  for (let i = 0; i < length; i++) {
    s += choose(RANDOM_ID_SOURCE.split(''));
  }
  return s;
}

function randomString(length: number): string {
  let s = '';
  for (let i = 0; i < length; i++) {
    s += choose(RANDOM_STRING_SOURCE.split(''));
  }
  return s;
}

function randomStringMinMax(minLength: number, maxLength: number): string {
  if (minLength < 0 || maxLength < 0) {
    throw Error('');
  }
  if (minLength > maxLength) {
    let tmp = minLength;
    minLength = maxLength;
    maxLength = tmp;
  }
  let length = minLength + Math.floor(Math.random() * (maxLength - minLength + 1));
  return randomString(length);
}

let CATEGORIES: string[] = [
  'Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

let TAGS: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];

function choose<T>(a: T[]): T {
  if (a.length <= 0) {
    throw Error('');
  }
  return a[Math.floor(Math.random() * a.length)];
}

function randomUrl(): string {
  let procotols = ['http', 'https'];
  let sub_domains = ['www.', ''];
  let top_domains = ['.com', '.org', '.net', '.gov', '.edu', '.io'];
  let domainName = randomID(3 + Math.floor(Math.random() * 10));
  let path = randomID(3 + Math.floor(Math.random() * 10));
  return `${choose(procotols)}://${choose(sub_domains)}${domainName}${choose(top_domains)}/${path}`
}

function enumValues(a: any) {
  return Object.keys(a).filter(x => isNaN(Number(x))).map(x => a[x]);
}

function createRandomPage(): Page {
  let tags: string[] = [];
  let tagNumbers: number[] = [0, 0, 0, 1, 1, 1, 1, 2, 2, 3];
  let tagNumber = choose(tagNumbers);
  for (let i = 0; i < tagNumber; i++) {
    tags.push(choose(TAGS));
  }
  let id = randomID(6);
  let saveTime = Math.floor(Math.random() * 31);
  let updateTime = Math.floor(Math.random() * saveTime);
  return {
    sourceUrl: randomUrl(),
    id: id,
    saveTime: moment().subtract(saveTime, 'days'),
    updateTime: choose([moment().subtract(updateTime), undefined, undefined]),
    remindReadingTime: choose([moment().add(Math.floor(Math.random() * 8)), undefined, undefined, undefined, undefined]),
    filePath: id + '.html',
    type: choose(enumValues(PageType)) as PageType,
    source: choose(enumValues(PageSource)) as PageSource,
    method: choose(enumValues(ImportMethod)) as ImportMethod,
    tags: tags,
    category: choose(CATEGORIES),
    title: randomStringMinMax(5, 15),
    desc: randomStringMinMax(50, 100),
    rating: choose(enumValues(Rating)) as Rating,
  };
}

/** Builds and returns a new User. */
function createNewUser(id: number): UserData {
  const name =
    NAMES[Math.round(Math.random() * (NAMES.length - 1))] +
    ' ' +
    NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) +
    '.';

  return {
    id: id.toString(),
    name: name,
    progress: Math.round(Math.random() * 100).toString(),
    fruit: FRUITS[Math.round(Math.random() * (FRUITS.length - 1))],
  };
}
