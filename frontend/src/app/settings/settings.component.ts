import { Component, OnInit } from '@angular/core';
import { getConfig } from '../settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  title = '设置';
  constructor() { }

  settings = getConfig();

  ngOnInit(): void {
  }

  selectFile(ev: Event) {
    alert('请打开桌面版使用该功能');
  }
}
