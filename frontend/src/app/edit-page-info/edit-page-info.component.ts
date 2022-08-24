import { DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observer } from 'rxjs';
import { CategoryInputComponent } from '../category-input/category-input.component';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { clonePage, Page, unmarshalPage } from '../page.model';
import { RatingComponent } from '../rating/rating.component';
import { PageService } from '../service/page.service';
import { TagsInputComponent } from '../tags-input/tags-input.component';
import { ToolBoxService } from '../tool-box.service';

export interface EditPageData {
  page: Page
  categories: string[]
  tags: string[]
}

@Component({
  selector: 'app-edit-page-info',
  templateUrl: './edit-page-info.component.html',
  styleUrls: ['./edit-page-info.component.css']
})
export class EditPageInfoComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: EditPageData, private pageService: PageService, private dialogRef: MatDialogRef<EditPageInfoComponent>, private toolbox: ToolBoxService) {
    this.title = data.page.title;
    this.desc = data.page.desc;
  }

  ngOnInit(): void {
  }

  title: string;
  desc: string;

  @ViewChild(TagsInputComponent) tags: TagsInputComponent;
  @ViewChild(CategoryInputComponent) category: CategoryInputComponent;
  @ViewChild(RatingComponent) rating: RatingComponent;
  @ViewChild(DateTimePickerComponent) date: DateTimePickerComponent;
  get editedPage(): Page {
    let page = clonePage(this.data.page);
    page.title = this.title;
    page.desc = this.desc;
    page.tags = this.tags.control.value || [];
    page.category = this.category.value;
    page.rating = this.rating.rating;
    page.remindReadingTime = this.date.current;
    return page;
  }

  isSaving = false;

  savePage() {
    let thisRef = this;
    this.isSaving = true;
    let savedPage: Page;
    console.log(this.editedPage);
    this.pageService.update(this.editedPage).subscribe({
      next(value) {
        thisRef.isSaving = false;
        savedPage = unmarshalPage([value])[0];
      },
      complete() {
        thisRef.isSaving = false;
        thisRef.dialogRef.close(savedPage);
      },
      error(err) {
        thisRef.isSaving = false;
        thisRef.toolbox.openSnackBar('保存失败，请重试', 'OK');
      },
    } as Observer<any>)
  }
}
