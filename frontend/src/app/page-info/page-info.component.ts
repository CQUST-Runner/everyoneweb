import { Component, Input, OnInit } from '@angular/core';
import { Page, pageAbsPath } from '../page.model';
import { ToolBoxService } from '../tool-box.service';

@Component({
  selector: 'app-page-info',
  templateUrl: './page-info.component.html',
  styleUrls: ['./page-info.component.css']
})
export class PageInfoComponent implements OnInit {

  @Input() page: Page;
  @Input() full: boolean = false;
  @Input() thumbnail: boolean = true;

  constructor(public toolbox: ToolBoxService) { }

  ngOnInit(): void {
  }

  absPath(): string {
    return pageAbsPath(this.page);
  }
}
