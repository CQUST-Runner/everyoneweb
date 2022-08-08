import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Page } from '../page.model';

@Component({
  selector: 'app-export-as',
  templateUrl: './export-as.component.html',
  styleUrls: ['./export-as.component.css']
})
export class ExportAsComponent implements OnInit {

  exported = false;
  isExporting = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: Page) { }

  ngOnInit(): void {
  }

  selected: string = 'html';
  
  export() {
    this.isExporting = true;
    setTimeout(() => {
      this.isExporting = false;
      this.exported = true;
    }, 2000);
  }
}
