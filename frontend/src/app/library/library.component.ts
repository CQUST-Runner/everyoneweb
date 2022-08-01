import { Component, OnInit } from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import {ThemePalette} from '@angular/material/core';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {

  constructor() { 
    
  }

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
      
        remove(fruit: string): void {
          const index = this.fruits.indexOf(fruit);
      
          if (index >= 0) {
            this.fruits.splice(index, 1);
          }
        }
        color: ThemePalette = 'accent';
        displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
        dataSource = ELEMENT_DATA;
}
