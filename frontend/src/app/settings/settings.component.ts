import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import { documentDir } from '@tauri-apps/api/path';
import { Observer } from 'rxjs';
import { ActionSnackBarComponentComponent, ActionSnackBarData, SnackBarAction } from '../action-snack-bar-component/action-snack-bar-component.component';
import { ColumnEditComponent } from '../column-edit/column-edit.component';
import { isTauri, normalizePath } from '../common';
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
  constructor(private settingsService: SettingsService, private toolbox: ToolBoxService, private dialog: MatDialog, private router: Router) {
    this.columns = this.settings.columns || [];
    this.columns.push(...columnDefine.filter(x => x.configurable && !this.columns.some(y => y.id == x.id)).map(x => { return { id: x.id, display: x.display } as ColumnInfo }));
    this.columns = this.columns.filter(x => columnDefine.some(y => y.id == x.id));
  }

  settings = { ...getConfig() };

  ngOnInit(): void {
  }

  async selectFile(ev: Event) {
    if (!isTauri()) {
      alert('请打开桌面版使用该功能');
      return;
    }
    const selected = await open({
      title: '请选择数据目录',
      multiple: false,
      defaultPath: await documentDir(),// or, desktopDir()?
      directory: true,
    });
    if (Array.isArray(selected)) {
      // user selected multiple files
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single file
      this.settings.dataDirectory = normalizePath(selected);
    }
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
    this.settings.dataDirectory = normalizePath(this.settings.dataDirectory);
    this.isSaving = true;
    let thisRef = this;
    this.settingsService.update(this.settings).subscribe({
      next(value) {
      },
      complete() {
        let actions: SnackBarAction[] = [];
        if (isTauri()) {
          actions.push({
            name: '立即重启',
            fn: () => invoke('restart_command'),
          } as SnackBarAction);
        } else {
          actions.push({
            name: '如何重启？',
            fn: () => { thisRef.router.navigate(['/view/', { id: 'manual.html', tp: 'doc' }]); },
          } as SnackBarAction);
        }
        thisRef.toolbox.openComponentSnackBar(ActionSnackBarComponentComponent,
          {
            data: {
              allowDismiss: true,
              actions: actions,
              message: '保存成功, 有些设置需要重启系统服务生效',
            } as ActionSnackBarData
          } as MatSnackBarConfig);

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

  exportAll() {
    this.toolbox.openSnackBar('敬请期待', 'OK');
  }
}
