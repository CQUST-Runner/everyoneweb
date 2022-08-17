import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Page } from '../page.model';
import { ToolBoxService } from '../tool-box.service';

export interface SavePageSuccessActionsData {
  page: Page
  message: string
}

@Component({
  selector: 'app-save-page-success-actions',
  templateUrl: './save-page-success-actions.component.html',
  styleUrls: ['./save-page-success-actions.component.css']
})
export class SavePageSuccessActionsComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: SavePageSuccessActionsData, private router: Router, private toolbox: ToolBoxService) { }

  ngOnInit(): void {
  }

  openInNewTag() {
    if (this.data.page) {
      window.open(this.toolbox.getLocalUrl(this.data.page), '_blank');
    } else {
      this.data.message = '打开异常';
    }
  }

  navigateToLibrary() {
    this.router.navigateByUrl('/library');
  }
}
