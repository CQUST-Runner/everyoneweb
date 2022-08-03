import { AfterViewInit, Component, OnInit } from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {ThemePalette} from '@angular/material/core';
import {MatSelectionList} from '@angular/material/list';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { ViewChild} from '@angular/core';

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
export class LibraryComponent implements OnInit,AfterViewInit {


  ngOnInit(): void {
  }
  typesOfShoes: string[] = [
    'Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers',
     'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs',
      'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers',
       'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins',
        'Sneakers'];

        fruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
        allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
      
      
        
        add(event: MatChipInputEvent): void {
          const value = (event.value || '').trim();
      
          // Add our fruit
          if (value) {
            this.fruits.push(value);
          }
      
          // Clear the input value
          event.chipInput!.clear();
      
        }
      
        color: ThemePalette = 'accent';
        
        select(b:boolean,t:MatSelectionList) {
          if (b){
            t.selectAll();
          }else{
            t.deselectAll();
          }
        }
        
        displayedColumns: string[] = ['name', 'progress', 'fruit', 'menu'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
    // Create 100 users
    const users = Array.from({length: 100}, (_, k) => createNewUser(k + 1));

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(users);
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
