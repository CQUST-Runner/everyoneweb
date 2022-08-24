import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab-tool-bar',
  templateUrl: './tab-tool-bar.component.html',
  styleUrls: ['./tab-tool-bar.component.css']
})
export class TabToolBarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() url: string;
  @Input() title: string;
}
