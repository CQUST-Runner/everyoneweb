import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmData {
  prompt: string
  yesText: string
  noText: string
}

@Component({
  selector: 'app-make-confirm',
  templateUrl: './make-confirm.component.html',
  styleUrls: ['./make-confirm.component.css']
})
export class MakeConfirmComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmData) { }

  ngOnInit(): void {
  }

}
