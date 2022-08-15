import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { PagePreviewComponent } from '../page-preview/page-preview.component';
import { PageService } from '../service/page.service';
import { Page } from '../page.model';
import { Observer } from 'rxjs';
import { TagsInputComponent } from '../tags-input/tags-input.component';
import { FormatSelectionComponent } from '../format-selection/format-selection.component';
import { ToolBoxService } from '../tool-box.service';

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

  constructor(private toolbox: ToolBoxService, public dialog: MatDialog, private pageService: PageService) { }

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
  isLoading = false;

  category: string;

  @ViewChild(TagsInputComponent) tags: TagsInputComponent;
  @ViewChild(FormatSelectionComponent) format: FormatSelectionComponent;
  savePage() {
    let p = {
      sourceUrl: this.value,
      category: this.category,
      tags: this.tags.control?.value,
      type: this.format.selected,
      saveTime: moment(),
      remindReadingTime: this.dateControl.value ? moment(this.dateControl.value) : undefined,
    } as Page;

    console.log(p);

    this.isLoading = true;
    let thisRef = this;
    this.pageService.save(p).subscribe({
      next(x: Page) {
      },
      complete() {
        thisRef.toolbox.openSnackBar("保存成功", "OK");
        thisRef.isLoading = false;
      },
      error(err) {
        thisRef.toolbox.openSnackBar("保存失败，请重试", "OK");
        thisRef.isLoading = false;
      },
    } as Observer<Page>)
  }
}
