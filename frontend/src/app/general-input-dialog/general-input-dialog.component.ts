import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface GeneralInputOptions {
  dialogTitle: string
  fieldName: string
}

@Component({
  selector: 'app-general-input-dialog',
  templateUrl: './general-input-dialog.component.html',
  styleUrls: ['./general-input-dialog.component.css']
})
export class GeneralInputDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: GeneralInputOptions) { }

  ngOnInit(): void {
  }

  value: string;
}
