import { Component, OnInit } from '@angular/core';
import { Observer } from 'rxjs';
import { getConfig, Settings } from '../settings.model';
import { SettingsService } from '../settings.service';
import { ToolBoxService } from '../tool-box.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  title = '设置';
  constructor(private settingsService: SettingsService, private toolbox: ToolBoxService) { }

  settings = getConfig();

  ngOnInit(): void {
  }

  selectFile(ev: Event) {
    alert('请打开桌面版使用该功能');
  }

  isSaving = false;
  saveSettings() {
    this.isSaving = true;
    let thisRef = this;
    this.settingsService.update(getConfig()).subscribe({
      next(value) {
      },
      complete() {
        thisRef.toolbox.openSnackBar('保存成功', 'OK');
        thisRef.isSaving = false;
      },
      error(err) {
        thisRef.toolbox.openSnackBar('保存失败，请重试', 'OK');
        thisRef.isSaving = false;
      },
    } as Observer<Settings>)
  }
}
