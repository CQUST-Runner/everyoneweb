import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Page } from '../page.model';

@Component({
  selector: 'app-edit-page-info',
  templateUrl: './edit-page-info.component.html',
  styleUrls: ['./edit-page-info.component.css']
})
export class EditPageInfoComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: Page) { }

  ngOnInit(): void {
  }


}
