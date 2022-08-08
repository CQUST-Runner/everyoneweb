import { Component, Input, OnInit } from '@angular/core';
import { Page } from '../page.model';

@Component({
  selector: 'app-page-info',
  templateUrl: './page-info.component.html',
  styleUrls: ['./page-info.component.css']
})
export class PageInfoComponent implements OnInit {

  @Input() page: Page;
  @Input() full: boolean = false;
  @Input() thumbnail: boolean = true;
  
  constructor() { }

  ngOnInit(): void {
  }

}
