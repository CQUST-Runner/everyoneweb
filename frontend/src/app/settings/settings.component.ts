import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observer } from 'rxjs';
import { ColumnEditComponent } from '../column-edit/column-edit.component';
import { columnDefine } from '../library/library.component';
import { ColumnInfo, getConfig, Settings } from '../settings.model';
import { SettingsService } from '../settings.service';
import { ToolBoxService } from '../tool-box.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  title = '设置';
  columns: ColumnInfo[];
  constructor(private settingsService: SettingsService, private toolbox: ToolBoxService, private dialog: MatDialog) {
    this.columns = this.settings.columns || [];
    this.columns.push(...columnDefine.filter(x => x.configurable && !this.columns.some(y => y.id == x.id)).map(x => { return { id: x.id, display: x.display } as ColumnInfo }));
    this.columns = this.columns.filter(x => columnDefine.some(y => y.id == x.id));
  }

  settings = { ...getConfig() };

  ngOnInit(): void {
  }

  selectFile(ev: Event) {
    alert('请打开桌面版使用该功能');
  }

  applyConfig() {
    Object.entries(this.settings).forEach(
      ([key, value]) => {
        (getConfig() as any)[key] = value;
      })
  }

  editColumn() {
    const dialogRef = this.dialog.open(ColumnEditComponent, { width: "40vw", data: this.columns });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result) {
        this.settings.columns = result;
      }
    });
  }
  resetSettings() {
    this.settings = { ...getConfig() };
  }

  isSaving = false;
  saveSettings() {
    this.isSaving = true;
    let thisRef = this;
    this.settingsService.update(this.settings).subscribe({
      next(value) {
      },
      complete() {
        thisRef.toolbox.openSnackBar('保存成功', 'OK');
        thisRef.isSaving = false;
        thisRef.applyConfig();
      },
      error(err) {
        thisRef.toolbox.openSnackBar('保存失败，请重试', 'OK');
        thisRef.isSaving = false;
      },
    } as Observer<Settings>)
  }

  mapBroswerLanguge(): string {
    switch (navigator.language) {
      case 'zh':
      case 'zh-CN':
        return 'sc';
      case 'zh-HK':
      case 'zh-TW':
        return 'tc';
      case 'ja':
        return 'ja';
    }
    return 'en';
  }

  currentLanguage(): string {
    switch (this.mapBroswerLanguge()) {
      case 'en': return navigator.language;
      case 'sc': return '中文【简体】';
      case 'tc': return '中文【繁体】';
      case 'ja': return '日本語';
    }
    return navigator.language;
  }
}
