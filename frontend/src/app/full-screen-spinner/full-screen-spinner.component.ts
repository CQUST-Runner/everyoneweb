import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-full-screen-spinner',
  templateUrl: './full-screen-spinner.component.html',
  styleUrls: ['./full-screen-spinner.component.css']
})
export class FullScreenSpinnerComponent implements OnInit {

  constructor() { }

  @Input('isShow') isShow: boolean;
  ngOnInit(): void {
  }

}
