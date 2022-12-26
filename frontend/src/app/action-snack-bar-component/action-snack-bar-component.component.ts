import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface SnackBarAction {
  fn: () => void
  name: string
}

export interface ActionSnackBarData {
  actions: SnackBarAction[]
  allowDismiss: boolean
  message: string
}

@Component({
  selector: 'app-action-snack-bar-component',
  templateUrl: './action-snack-bar-component.component.html',
  styleUrls: ['./action-snack-bar-component.component.css']
})
export class ActionSnackBarComponentComponent implements OnInit {


  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: ActionSnackBarData,
    public ref: MatSnackBarRef<ActionSnackBarComponentComponent>) {
  }

  ngOnInit(): void {
  }
}
