import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-move-to-dialog',
  templateUrl: './move-to-dialog.component.html',
  styleUrls: ['./move-to-dialog.component.css']
})
export class MoveToDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public categories: string[]) { }

  ngOnInit(): void {
  }

}
