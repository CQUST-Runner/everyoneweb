import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  title = '设置';
  constructor() { }

  ngOnInit(): void {
  }

  selectFile(ev: Event) {
    alert('请打开桌面版使用该功能');
  }
}
