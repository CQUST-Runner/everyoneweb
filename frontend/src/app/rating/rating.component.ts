import { FIVE } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Rating } from '../page.model';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit {

  @Input() rating: Rating = FIVE;
  constructor() { }

  @Input() readonly: boolean = false;

  @Output() change: EventEmitter<Rating> = new EventEmitter<Rating>();
  ngOnInit(): void {
  }

  onClick(i: number) {
    if (this.readonly) {
      return;
    }
    if (this.rating == i) {
      this.rating = i - 1;
    } else {
      this.rating = i;
    }
    this.change.emit(this.rating);
  }
}
