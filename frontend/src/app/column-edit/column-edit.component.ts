import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { columnDefine } from '../library/library.component';
import { ColumnInfo } from '../settings.model';

@Component({
  selector: 'app-column-edit',
  templateUrl: './column-edit.component.html',
  styleUrls: ['./column-edit.component.css']
})
export class ColumnEditComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public columns: ColumnInfo[]) {
  }

  ngOnInit(): void {
  }


  getDisplayName(id: string): string | undefined {
    return columnDefine.find(x => x.id == id)?.displayName;
  }

  drop(event: CdkDragDrop<ColumnInfo[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
