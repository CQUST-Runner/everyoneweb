import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Page } from '../page.model';

@Component({
  selector: 'app-page-info-dialog',
  templateUrl: './page-info-dialog.component.html',
  styleUrls: ['./page-info-dialog.component.css']
})
export class PageInfoDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: Page) { }

  ngOnInit(): void {
  }

}
