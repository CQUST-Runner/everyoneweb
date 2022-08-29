import { NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import * as moment from 'moment';
import { Moment } from 'moment';

// If using Moment
const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: "l, LTS"
  },
  display: {
    dateInput: "L HH:mm",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.css'],
  providers: [{ provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },]
})
export class DateTimePickerComponent implements OnInit {

  constructor() {
    this.dateControl.valueChanges.subscribe(x => {
      this.changed.next(x);
    });
  }

  ngOnInit(): void {
  }

  public date: moment.Moment;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public minDate: moment.Moment;
  public maxDate: moment.Moment;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;

  public dateControl = new FormControl<moment.Moment | null>(null);

  color: ThemePalette = 'primary';

  @Input() set initial(initial: Moment | null) {
    this.dateControl.setValue(initial, { emitEvent: true });
  }

  @Output() changed: EventEmitter<moment.Moment | null> = new EventEmitter();
  @Input() readonly: boolean = false;
  get current(): Moment {
    return moment(this.dateControl.value);
  }
}
