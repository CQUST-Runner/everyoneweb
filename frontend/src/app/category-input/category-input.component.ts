import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, merge, Observable, startWith, Subject } from 'rxjs';

@Component({
  selector: 'app-category-input',
  templateUrl: './category-input.component.html',
  styleUrls: ['./category-input.component.css']
})
export class CategoryInputComponent implements OnInit, OnChanges {

  constructor() { }

  inputChanges: Subject<null> = new Subject();
  myControl = new FormControl('');
  @Input() categories: string[] = [];
  filteredOptions: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions =
      merge(this.myControl.valueChanges, this.inputChanges).pipe(
        startWith(''),
        map(value => this._filter(value || '')),
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.inputChanges.next(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.categories.filter(option => option.toLowerCase().includes(filterValue));
  }
}
