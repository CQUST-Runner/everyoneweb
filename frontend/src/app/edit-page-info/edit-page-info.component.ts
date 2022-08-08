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


  public date: moment.Moment;
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public minDate: moment.Moment;
  public maxDate: moment.Moment;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;

  public dateControl = new FormControl(this.data.remindReadingTime);
}
