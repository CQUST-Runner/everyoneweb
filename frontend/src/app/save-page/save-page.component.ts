import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { PagePreviewComponent } from '../page-preview/page-preview.component';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export interface Fruit {
  name: string;
}

@Component({
  selector: 'app-save-page',
  templateUrl: './save-page.component.html',
  styleUrls: ['./save-page.component.css']
})
export class SavePageComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  title = '首页';
  ngOnInit(): void {
  }

  value: string;
  emailFormControl = new FormControl('', [Validators.required, Validators.pattern(/^(ftp|http|https):\/\/[^ "]+$/)]);

  matcher = new MyErrorStateMatcher();

  onFolderSelected(ev: Event) {

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
  public color: ThemePalette = 'primary';

  public dateControl = new FormControl(new Date(2021, 9, 4, 5, 6, 7));

  openPreview() {
    const dialogRef = this.dialog.open(PagePreviewComponent, { width: "80vw" });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  @ViewChild("options_container") d: ElementRef;
  showOptions() {
      this.d.nativeElement.classList.add('options-anim');
  }
  
  hideOptions() {
    this.d.nativeElement.classList.remove('options-anim');
  }
}
