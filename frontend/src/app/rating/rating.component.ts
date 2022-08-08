import { FIVE } from '@angular/cdk/keycodes';
import { Component, Input, OnInit } from '@angular/core';
import { Rating } from '../page.model';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit {

  @Input() rating: Rating = FIVE;
  constructor() { }

  @Input() click: (rating: Rating) => void;
  ngOnInit(): void {
  }

  onClick(i: number) {
    this.rating = i;
    if (this.click) {
      this.click(i);
    }
  }
}
