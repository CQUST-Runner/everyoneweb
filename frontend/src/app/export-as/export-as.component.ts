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
  constructor(@Inject(MAT_DIALOG_DATA) public data: Page) { }

  ngOnInit(): void {
  }

  export() {
    this.exported = true;
  }
}
