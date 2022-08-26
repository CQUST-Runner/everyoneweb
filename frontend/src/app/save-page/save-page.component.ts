import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { PagePreviewComponent } from '../page-preview/page-preview.component';
import { PageService } from '../service/page.service';
import { Page } from '../page.model';
import { Observer } from 'rxjs';
import { TagsInputComponent } from '../tags-input/tags-input.component';
import { FormatSelectionComponent } from '../format-selection/format-selection.component';
import { ToolBoxService } from '../tool-box.service';
import { SavePageSuccessActionsComponent, SavePageSuccessActionsData } from '../save-page-success-actions/save-page-success-actions.component';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { CategoryInputComponent } from '../category-input/category-input.component';

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

  updateAllCategories(categories: string[]) {
    this.allCategories = [...new Set((this.allCategories || []).concat(categories.filter(x => x != '')))];
  }

  updateAllTags(tags: string[]) {
    this.allTags = [...new Set((this.allTags || []).concat(tags.filter(x => x != '')))];
  }
  allCategories: string[] = [];
  allTags: string[] = [];
  title = '新建';
  ngOnInit(): void {
    let thisRef = this;
    this.pageService.pageList().subscribe({
      next(value) {
        thisRef.updateAllCategories(value.filter(x => x.category != "").map(x => x.category));
        thisRef.updateAllTags(value.map(x => x.tags).flat().filter(x => x != ""));
        console.log(thisRef.allCategories);
        console.log(thisRef.allTags);
      },
    } as Observer<any[]>)
  }

  value: string;
  emailFormControl = new FormControl('', [Validators.required, Validators.pattern(/^(ftp|http|https):\/\/[^ "]+$/)]);

  matcher = new MyErrorStateMatcher();

  onFolderSelected(ev: Event) {
  }

  openPreview() {
    const dialogRef = this.dialog.open(PagePreviewComponent, { width: "80vw", data: this.value });

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


  onInput(ev: Event) {
    this.emailFormControl.setValue(this.value);
  }

  @ViewChild(TagsInputComponent) tags: TagsInputComponent;
  @ViewChild(FormatSelectionComponent) format: FormatSelectionComponent;
  @ViewChild(DateTimePickerComponent) picker: DateTimePickerComponent;
  @ViewChild(CategoryInputComponent) category: CategoryInputComponent;
  savePage() {
    let p = {
      sourceUrl: this.value,
      category: this.category.myControl.value,
      tags: this.tags.control?.value,
      type: this.format.selected,
      saveTime: moment(),
      remindReadingTime: this.picker.dateControl.value ? moment(this.picker.dateControl.value) : undefined,
    } as Page;

    console.log(p);

    this.isLoading = true;
    let thisRef = this;
    let savedPage: Page | undefined = undefined;
    this.pageService.save(p).subscribe({
      next(x: Page) {
        savedPage = x;
      },
      complete() {
        if (savedPage != undefined) {
          thisRef.toolbox.openComponentSnackBar(SavePageSuccessActionsComponent,
            {
              data: { page: savedPage, message: "保存成功" } as SavePageSuccessActionsData,
              duration: 1000 * 5
            } as MatSnackBarConfig);
          thisRef.updateAllCategories([savedPage.category]);
          thisRef.updateAllTags(savedPage.tags);
        } else {
          thisRef.toolbox.openSnackBar("保存失败，请重试", "OK");
        }
        thisRef.isLoading = false;

      },
      error(err) {
        thisRef.toolbox.openSnackBar("保存失败，请重试", "OK");
        thisRef.isLoading = false;
      },
    } as Observer<Page>)
  }
}
