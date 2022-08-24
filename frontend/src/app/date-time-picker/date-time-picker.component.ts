import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import * as moment from 'moment';
import { Moment } from 'moment';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.css']
})
export class DateTimePickerComponent implements OnInit {

  constructor() { }

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

  public dateControl = new FormControl(new Date(2021, 9, 4, 5, 6, 7));

  color: ThemePalette = 'primary';

  @Input() set initial(initial: Moment | null) {
    this.dateControl.setValue(initial ? initial.toDate() : null);
  }

  get current(): Moment {
    return moment(this.dateControl.value);
  }
}
