import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
  selector: 'app-tags-input',
  templateUrl: './tags-input.component.html',
  styleUrls: ['./tags-input.component.css']
})
export class TagsInputComponent implements OnInit,AfterViewInit {

  constructor() { }

  ngOnInit(): void {
    
    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => (fruit ? this._filter(fruit) : this._filter(''))),
    );

  }
  
  ngAfterViewInit(): void {
    this.control.value?.push(...this.initialTags);
  }
  
  @Input() initialTags: string[] = [];
  
  @Input() control = new FormControl([] as string[]);

  
  
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl('');
  filteredFruits: Observable<string[]>;

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.control.value?.push(value);
      this.control.updateValueAndValidity();
    }

    // Clear the input value
    event.chipInput!.clear();

    this.fruitCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.control.value?.indexOf(fruit);
    if (index === undefined) {
      return;
    }
    if (index >= 0) {
      this.control.value?.splice(index, 1);
      this.control.updateValueAndValidity();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.control.value?.push(event.option.viewValue);
    this.control.updateValueAndValidity();
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }
  allFruits: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry', '无标签'];

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    
    
    return this.allFruits.filter(fruit=> this.control.value?!this.control.value.some(f=>f===fruit):true ). filter(fruit => fruit.toLowerCase().includes(filterValue));
  }

}
